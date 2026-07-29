const express = require('express');
const { randomUUID } = require('node:crypto');

const { createOAuthTransaction, randomBase64Url, safeEqual } = require('./crypto');
const { MemorySessionStore } = require('./session-store');
const { UaePassClient, minimizeProfile } = require('./uae-pass-client');

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function localReturnPath(value) {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  return value.slice(0, 2_048);
}

function cookieHeader(config, id, maxAgeSeconds) {
  const parts = [
    `${config.cookieName}=${encodeURIComponent(id)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${config.cookieSameSite}`,
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (config.cookieSecure) parts.push('Secure');
  return parts.join('; ');
}

function createRateLimiter({ now = Date.now, windowMs = 15 * 60 * 1000 } = {}) {
  const buckets = new Map();
  return (limit) => (request, response, next) => {
    const key = `${request.ip}:${request.path}`;
    const current = buckets.get(key);
    const timestamp = now();
    const bucket =
      !current || current.resetAt <= timestamp
        ? { count: 0, resetAt: timestamp + windowMs }
        : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > limit) {
      response.status(429).json({ error: 'rate_limited', correlationId: request.correlationId });
      return;
    }
    next();
  };
}

function createApp({
  config,
  store = new MemorySessionStore(),
  fetchImpl = globalThis.fetch,
  logger = console,
  now = Date.now,
} = {}) {
  if (!config) throw new Error('BFF configuration is required');
  if (config.nodeEnv === 'production' && store instanceof MemorySessionStore) {
    throw new Error('Production requires a shared session store');
  }

  const app = express();
  const client = new UaePassClient(config, fetchImpl);
  const rateLimit = createRateLimiter({ now });
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use((request, response, next) => {
    request.correlationId = randomUUID();
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    if (config.nodeEnv === 'production') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    const origin = request.headers.origin;
    if (origin && config.allowedOrigins.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Vary', 'Origin');
    }
    if (request.method === 'OPTIONS') {
      if (!origin || !config.allowedOrigins.includes(origin)) {
        response.status(403).end();
        return;
      }
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
      response.status(204).end();
      return;
    }
    next();
  });

  app.use((request, response, next) => {
    const startedAt = now();
    response.on('finish', () => {
      logger.info?.({
        correlationId: request.correlationId,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMs: Math.max(0, now() - startedAt),
        environment: config.environment,
      });
    });
    next();
  });

  app.use(express.json({ limit: '8kb', strict: true }));

  function getSessionId(request) {
    return parseCookies(request.headers.cookie)[config.cookieName] || null;
  }

  function setSessionCookie(response, id) {
    response.setHeader(
      'Set-Cookie',
      cookieHeader(config, id, Math.floor(config.sessionTtlMs / 1000))
    );
  }

  function clearSessionCookie(response) {
    response.setHeader('Set-Cookie', cookieHeader(config, '', 0));
  }

  function requireAllowedOrigin(request, response) {
    const origin = request.headers.origin;
    if (!origin || !config.allowedOrigins.includes(origin)) {
      response.status(403).json({ error: 'origin_rejected', correlationId: request.correlationId });
      return false;
    }
    return true;
  }

  app.get('/auth/uae-pass/login', rateLimit(10), async (request, response, next) => {
    try {
      let sessionId = getSessionId(request);
      let session = sessionId ? await store.get(sessionId) : null;
      if (!session) {
        sessionId = randomBase64Url(32);
        session = { transactions: {} };
      }

      const transaction = createOAuthTransaction(config.pkceEnabled, now());
      transaction.returnTo = localReturnPath(request.query.returnTo);
      session.transactions ||= {};
      session.transactions[transaction.state] = transaction;
      await store.set(sessionId, session, config.sessionTtlMs);
      setSessionCookie(response, sessionId);

      const authorizationUrl = new URL(config.authorizationUrl);
      const uiLocales = request.query.ui_locales === 'ar' ? 'ar' : 'en';
      const authorizationParameters = {
        response_type: 'code',
        client_id: config.clientId,
        scope: config.scope,
        state: transaction.state,
        redirect_uri: config.redirectUri,
        acr_values: config.acrValues,
        ui_locales: uiLocales,
      };
      if (config.pkceEnabled) {
        authorizationParameters.code_challenge = transaction.challenge;
        authorizationParameters.code_challenge_method = 'S256';
      }
      authorizationUrl.search = new URLSearchParams(authorizationParameters).toString();
      response.redirect(302, authorizationUrl.toString());
    } catch (error) {
      next(error);
    }
  });

  app.get('/auth/uae-pass/callback', rateLimit(30), async (request, response, next) => {
    try {
      const sessionId = getSessionId(request);
      const session = sessionId ? await store.get(sessionId) : null;
      const state = typeof request.query.state === 'string' ? request.query.state : '';
      if (state.length > 256) {
        response
          .status(400)
          .json({ error: 'invalid_transaction', correlationId: request.correlationId });
        return;
      }
      const transaction = session?.transactions?.[state];

      if (
        !sessionId ||
        !session ||
        !transaction ||
        now() - transaction.createdAt > config.transactionTtlMs
      ) {
        response
          .status(400)
          .json({ error: 'invalid_transaction', correlationId: request.correlationId });
        return;
      }

      delete session.transactions[state];
      await store.set(sessionId, session, config.sessionTtlMs);

      if (request.query.error) {
        response.redirect(302, new URL('/?auth=cancelled', config.appOrigin).toString());
        return;
      }

      const code = typeof request.query.code === 'string' ? request.query.code : '';
      if (!code || code.length > 2_048) {
        response.status(400).json({ error: 'missing_code', correlationId: request.correlationId });
        return;
      }

      const tokens = await client.exchangeCode(code, transaction.verifier);
      const upstreamProfile = await client.fetchUserInfo(tokens.access_token);
      const newSessionId = randomBase64Url(32);
      const authenticatedSession = {
        authenticated: true,
        profile: minimizeProfile(upstreamProfile),
        csrfToken: randomBase64Url(32),
        tokens,
        tokenExpiresAt: now() + tokens.expires_in * 1000,
        createdAt: now(),
        transactions: session.transactions,
      };

      await store.delete(sessionId);
      await store.set(newSessionId, authenticatedSession, config.sessionTtlMs);
      setSessionCookie(response, newSessionId);
      response.redirect(302, new URL(transaction.returnTo, config.appOrigin).toString());
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/session', rateLimit(120), async (request, response, next) => {
    try {
      const sessionId = getSessionId(request);
      const session = sessionId ? await store.get(sessionId) : null;
      if (
        !sessionId ||
        !session?.authenticated ||
        typeof session.tokenExpiresAt !== 'number' ||
        session.tokenExpiresAt <= now()
      ) {
        if (sessionId) await store.delete(sessionId);
        clearSessionCookie(response);
        response.json({ authenticated: false, profile: null });
        return;
      }
      response.json({
        authenticated: true,
        profile: session.profile,
        csrfToken: session.csrfToken,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/auth/logout', rateLimit(20), async (request, response, next) => {
    try {
      if (!requireAllowedOrigin(request, response)) return;
      const sessionId = getSessionId(request);
      const session = sessionId ? await store.get(sessionId) : null;
      if (!session || !safeEqual(request.get('X-CSRF-Token'), session.csrfToken)) {
        response.status(403).json({ error: 'csrf_rejected', correlationId: request.correlationId });
        return;
      }
      await store.delete(sessionId);
      clearSessionCookie(response);
      const providerLogoutUrl = new URL(config.logoutUrl);
      providerLogoutUrl.searchParams.set('redirect_uri', config.logoutRedirectUri);
      response.json({ loggedOut: true, redirectUrl: providerLogoutUrl.toString() });
    } catch (error) {
      next(error);
    }
  });

  app.get('/health/live', (_request, response) => {
    response.json({ status: 'live' });
  });

  app.get('/health/ready', (_request, response) => {
    response.json({ status: 'ready', environment: config.environment });
  });

  app.use((request, response) => {
    response.status(404).json({ error: 'not_found', correlationId: request.correlationId });
  });

  app.use((error, request, response, _next) => {
    const code = typeof error?.code === 'string' ? error.code : 'internal_error';
    const status = Number.isInteger(error?.status) ? error.status : 500;
    logger.error?.({
      correlationId: request.correlationId,
      code,
      status,
      environment: config.environment,
    });
    response.status(status).json({ error: code, correlationId: request.correlationId });
  });

  return app;
}

module.exports = { createApp, localReturnPath, parseCookies };
