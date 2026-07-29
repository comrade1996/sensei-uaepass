const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { createServer } = require('node:http');
const test = require('node:test');

const { createApp, localReturnPath } = require('../src/app');
const { loadConfig } = require('../src/config');
const { MemorySessionStore } = require('../src/session-store');
const { UaePassClient } = require('../src/uae-pass-client');

function testConfig(overrides = {}) {
  return {
    nodeEnv: 'test',
    port: 0,
    environment: 'staging',
    appOrigin: 'http://app.example.test',
    allowedOrigins: ['http://app.example.test'],
    clientId: 'test-client',
    clientSecret: 'test-secret',
    redirectUri: 'http://bff.example.test/auth/uae-pass/callback',
    logoutRedirectUri: 'http://app.example.test/signed-out',
    scope: 'urn:uae:digitalid:profile:general',
    acrValues: 'test-acr',
    pkceEnabled: false,
    authorizationUrl: 'https://provider.example.test/authorize',
    tokenUrl: 'https://provider.example.test/token',
    userInfoUrl: 'https://provider.example.test/userinfo',
    logoutUrl: 'https://provider.example.test/logout',
    cookieName: 'test_session',
    cookieSecure: false,
    cookieSameSite: 'Lax',
    sessionTtlMs: 60_000,
    transactionTtlMs: 30_000,
    upstreamTimeoutMs: 1_000,
    maxUpstreamBytes: 8_192,
    trustProxy: false,
    ...overrides,
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function listen(app) {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      ),
  };
}

function cookieFrom(response) {
  return response.headers.get('set-cookie').split(';', 1)[0];
}

test('accepts only local return paths', () => {
  assert.equal(localReturnPath('/account?tab=security'), '/account?tab=security');
  assert.equal(localReturnPath('https://attacker.example'), '/');
  assert.equal(localReturnPath('//attacker.example'), '/');
  assert.equal(localReturnPath('/\\attacker.example'), '/');
});

test('requires complete configuration and safe cross-site cookie settings', () => {
  assert.throws(() => loadConfig({}), /UAE_PASS_ENVIRONMENT/);
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: 'development',
        APP_ORIGIN: 'http://app.example.test',
        UAE_PASS_ENVIRONMENT: 'staging',
        UAE_PASS_CLIENT_ID: 'client',
        UAE_PASS_CLIENT_SECRET: 'secret',
        UAE_PASS_REDIRECT_URI: 'http://bff.example.test/auth/uae-pass/callback',
        UAE_PASS_LOGOUT_REDIRECT_URI: 'http://app.example.test/signed-out',
        SESSION_COOKIE_SAME_SITE: 'None',
        SESSION_COOKIE_SECURE: 'false',
      }),
    /SESSION_COOKIE_SECURE/
  );
});

test('owns OAuth, rotates the session, and never returns provider tokens', async (context) => {
  const upstreamCalls = [];
  const logs = [];
  const fetchImpl = async (url, options) => {
    upstreamCalls.push({ url, options });
    if (new URL(url).pathname === '/token') {
      return jsonResponse({
        access_token: 'server-only-access-token',
        refresh_token: 'server-only-refresh-token',
        id_token: 'server-only-id-token',
        token_type: 'Bearer',
        expires_in: 300,
      });
    }
    return jsonResponse({
      sub: 'person-1',
      fullnameEN: 'Test Person',
      idn: '784-sensitive-id',
      mobile: '+971500000000',
    });
  };
  const app = createApp({
    config: testConfig(),
    store: new MemorySessionStore(),
    fetchImpl,
    logger: {
      info: (entry) => logs.push(entry),
      error: (entry) => logs.push(entry),
    },
  });
  const server = await listen(app);
  context.after(server.close);

  const login = await fetch(`${server.baseUrl}/auth/uae-pass/login?returnTo=%2Faccount`, {
    redirect: 'manual',
  });
  assert.equal(login.status, 302);
  const anonymousCookie = cookieFrom(login);
  const authorization = new URL(login.headers.get('location'));
  assert.equal(authorization.origin, 'https://provider.example.test');
  assert.equal(authorization.searchParams.get('ui_locales'), 'en');
  assert.equal(authorization.searchParams.has('code_challenge'), false);
  const state = authorization.searchParams.get('state');

  const callback = await fetch(
    `${server.baseUrl}/auth/uae-pass/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    {
      headers: { cookie: anonymousCookie },
      redirect: 'manual',
    }
  );
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), 'http://app.example.test/account');
  const authenticatedCookie = cookieFrom(callback);
  assert.notEqual(authenticatedCookie, anonymousCookie);

  const sessionResponse = await fetch(`${server.baseUrl}/api/session`, {
    headers: { cookie: authenticatedCookie },
  });
  const sessionText = await sessionResponse.text();
  const session = JSON.parse(sessionText);
  assert.equal(session.authenticated, true);
  assert.deepEqual(session.profile, { sub: 'person-1', fullnameEN: 'Test Person' });
  assert.equal(typeof session.csrfToken, 'string');
  assert.doesNotMatch(sessionText, /access_token|refresh_token|id_token|784-sensitive-id/);

  const replay = await fetch(
    `${server.baseUrl}/auth/uae-pass/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    {
      headers: { cookie: anonymousCookie },
      redirect: 'manual',
    }
  );
  assert.equal(replay.status, 400);

  const tokenRequest = upstreamCalls.find((entry) => new URL(entry.url).pathname === '/token');
  const tokenParameters = new URL(tokenRequest.url).searchParams;
  assert.equal(
    tokenRequest.options.headers.Authorization,
    `Basic ${Buffer.from('test-client:test-secret').toString('base64')}`
  );
  assert.equal(tokenRequest.options.headers['Content-Type'], 'multipart/form-data; charset=UTF-8');
  assert.equal(tokenParameters.get('grant_type'), 'authorization_code');
  assert.equal(tokenParameters.get('code'), 'authorization-code');
  assert.equal(tokenParameters.get('redirect_uri'), testConfig().redirectUri);
  assert.equal(tokenParameters.has('code_verifier'), false);
  assert.equal(tokenRequest.options.body, undefined);
  const userInfoRequest = upstreamCalls.find(
    (entry) => new URL(entry.url).pathname === '/userinfo'
  );
  assert.equal(userInfoRequest.options.headers.Authorization, 'Bearer server-only-access-token');
  assert.equal(
    userInfoRequest.options.headers['Content-Type'],
    'application/x-www-form-urlencoded'
  );

  const serializedLogs = JSON.stringify(logs);
  assert.doesNotMatch(
    serializedLogs,
    /authorization-code|server-only-access-token|server-only-refresh-token|784-sensitive-id/
  );

  const rejectedLogout = await fetch(`${server.baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      cookie: authenticatedCookie,
      origin: 'http://app.example.test',
      'content-type': 'application/json',
      'x-csrf-token': 'wrong-token',
    },
    body: '{}',
  });
  assert.equal(rejectedLogout.status, 403);

  const logout = await fetch(`${server.baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      cookie: authenticatedCookie,
      origin: 'http://app.example.test',
      'content-type': 'application/json',
      'x-csrf-token': session.csrfToken,
    },
    body: '{}',
  });
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), {
    loggedOut: true,
    redirectUrl:
      'https://provider.example.test/logout?redirect_uri=http%3A%2F%2Fapp.example.test%2Fsigned-out',
  });

  const afterLogout = await fetch(`${server.baseUrl}/api/session`, {
    headers: { cookie: authenticatedCookie },
  });
  assert.deepEqual(await afterLogout.json(), { authenticated: false, profile: null });
});

test('adds S256 PKCE only when UAE PASS onboarding confirms support', async (context) => {
  const upstreamCalls = [];
  const fetchImpl = async (url) => {
    upstreamCalls.push(url);
    return new URL(url).pathname === '/token'
      ? jsonResponse({ access_token: 'token', token_type: 'Bearer', expires_in: 300 })
      : jsonResponse({ sub: 'person-1' });
  };
  const server = await listen(
    createApp({
      config: testConfig({ pkceEnabled: true }),
      store: new MemorySessionStore(),
      fetchImpl,
      logger: { info() {}, error() {} },
    })
  );
  context.after(server.close);

  const login = await fetch(`${server.baseUrl}/auth/uae-pass/login`, { redirect: 'manual' });
  const cookie = cookieFrom(login);
  const authorization = new URL(login.headers.get('location'));
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');

  await fetch(
    `${server.baseUrl}/auth/uae-pass/callback?code=code&state=${authorization.searchParams.get('state')}`,
    { headers: { cookie }, redirect: 'manual' }
  );

  const tokenParameters = new URL(upstreamCalls.find((url) => new URL(url).pathname === '/token'))
    .searchParams;
  assert.equal(
    createHash('sha256').update(tokenParameters.get('code_verifier')).digest('base64url'),
    authorization.searchParams.get('code_challenge')
  );
});

test('fails closed on missing token expiry and invalid upstream content', async () => {
  const client = new UaePassClient(testConfig(), async () =>
    jsonResponse({ access_token: 'token', token_type: 'Bearer' })
  );
  await assert.rejects(() => client.exchangeCode('code', 'verifier'), /invalid_token_expiry/);

  const invalidClient = new UaePassClient(
    testConfig(),
    async () => new Response('<html>error</html>', { headers: { 'content-type': 'text/html' } })
  );
  await assert.rejects(
    () => invalidClient.exchangeCode('code', 'verifier'),
    /invalid_upstream_content_type/
  );

  const malformedClient = new UaePassClient(
    testConfig(),
    async () => new Response('{', { headers: { 'content-type': 'application/json' } })
  );
  await assert.rejects(
    () => malformedClient.exchangeCode('code', 'verifier'),
    /invalid_upstream_json/
  );

  const timeoutClient = new UaePassClient(
    testConfig({ upstreamTimeoutMs: 5 }),
    async (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      })
  );
  await assert.rejects(() => timeoutClient.exchangeCode('code', 'verifier'), /upstream_timeout/);
});

test('preserves independent concurrent login transactions', async (context) => {
  const fetchImpl = async (url) =>
    new URL(url).pathname === '/token'
      ? jsonResponse({ access_token: 'token', token_type: 'Bearer', expires_in: 300 })
      : jsonResponse({ sub: 'person-1' });
  const server = await listen(
    createApp({
      config: testConfig(),
      store: new MemorySessionStore(),
      fetchImpl,
      logger: { info() {}, error() {} },
    })
  );
  context.after(server.close);

  const firstLogin = await fetch(`${server.baseUrl}/auth/uae-pass/login?returnTo=%2Ffirst`, {
    redirect: 'manual',
  });
  const anonymousCookie = cookieFrom(firstLogin);
  const firstState = new URL(firstLogin.headers.get('location')).searchParams.get('state');
  const secondLogin = await fetch(`${server.baseUrl}/auth/uae-pass/login?returnTo=%2Fsecond`, {
    headers: { cookie: anonymousCookie },
    redirect: 'manual',
  });
  const secondState = new URL(secondLogin.headers.get('location')).searchParams.get('state');

  const firstCallback = await fetch(
    `${server.baseUrl}/auth/uae-pass/callback?code=first-code&state=${firstState}`,
    { headers: { cookie: anonymousCookie }, redirect: 'manual' }
  );
  assert.equal(firstCallback.status, 302);
  const rotatedCookie = cookieFrom(firstCallback);

  const secondCallback = await fetch(
    `${server.baseUrl}/auth/uae-pass/callback?code=second-code&state=${secondState}`,
    { headers: { cookie: rotatedCookie }, redirect: 'manual' }
  );
  assert.equal(secondCallback.status, 302);
  assert.equal(secondCallback.headers.get('location'), 'http://app.example.test/second');
});

test('rejects production startup with the in-memory store', () => {
  assert.throws(
    () =>
      createApp({
        config: testConfig({ nodeEnv: 'production' }),
        store: new MemorySessionStore(),
      }),
    /shared session store/
  );
});
