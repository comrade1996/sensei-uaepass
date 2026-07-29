const UAE_PASS_ENDPOINTS = {
  staging: 'https://stg-id.uaepass.ae',
  production: 'https://id.uaepass.ae',
};

function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function positiveInteger(value, fallback, name) {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function boolean(value, fallback) {
  if (value === undefined) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error('Boolean environment values must be "true" or "false"');
}

function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const environment = required(env, 'UAE_PASS_ENVIRONMENT');
  const baseUrl = UAE_PASS_ENDPOINTS[environment];
  if (!baseUrl) throw new Error('UAE_PASS_ENVIRONMENT must be "staging" or "production"');

  const appOrigin = new URL(required(env, 'APP_ORIGIN')).origin;
  const redirectUri = required(env, 'UAE_PASS_REDIRECT_URI');
  const redirect = new URL(redirectUri);
  if (redirect.pathname !== '/auth/uae-pass/callback') {
    throw new Error('UAE_PASS_REDIRECT_URI must use /auth/uae-pass/callback');
  }
  if (nodeEnv === 'production' && redirect.protocol !== 'https:') {
    throw new Error('UAE_PASS_REDIRECT_URI must use HTTPS in production');
  }

  const allowedOrigins = (env.ALLOWED_ORIGINS || appOrigin)
    .split(',')
    .map((value) => new URL(value.trim()).origin);
  const cookieSameSite = env.SESSION_COOKIE_SAME_SITE || 'Lax';
  if (!['Strict', 'Lax', 'None'].includes(cookieSameSite)) {
    throw new Error('SESSION_COOKIE_SAME_SITE must be "Strict", "Lax", or "None"');
  }
  const cookieSecure = boolean(env.SESSION_COOKIE_SECURE, nodeEnv === 'production');
  if (cookieSameSite === 'None' && !cookieSecure) {
    throw new Error('SESSION_COOKIE_SECURE must be true when SameSite=None');
  }

  return Object.freeze({
    nodeEnv,
    port: positiveInteger(env.PORT, 3001, 'PORT'),
    environment,
    appOrigin,
    allowedOrigins,
    clientId: required(env, 'UAE_PASS_CLIENT_ID'),
    clientSecret: required(env, 'UAE_PASS_CLIENT_SECRET'),
    redirectUri,
    logoutRedirectUri: required(env, 'UAE_PASS_LOGOUT_REDIRECT_URI'),
    scope: env.UAE_PASS_SCOPE || 'urn:uae:digitalid:profile:general',
    acrValues: env.UAE_PASS_ACR_VALUES || 'urn:safelayer:tws:policies:authentication:level:low',
    pkceEnabled: boolean(env.UAE_PASS_PKCE_ENABLED, false),
    authorizationUrl: `${baseUrl}/idshub/authorize`,
    tokenUrl: `${baseUrl}/idshub/token`,
    userInfoUrl: `${baseUrl}/idshub/userinfo`,
    logoutUrl: `${baseUrl}/idshub/logout`,
    cookieName: env.SESSION_COOKIE_NAME || 'uaepass_session',
    cookieSecure,
    cookieSameSite,
    sessionTtlMs: positiveInteger(env.SESSION_TTL_MS, 8 * 60 * 60 * 1000, 'SESSION_TTL_MS'),
    transactionTtlMs: positiveInteger(env.TRANSACTION_TTL_MS, 5 * 60 * 1000, 'TRANSACTION_TTL_MS'),
    upstreamTimeoutMs: positiveInteger(env.UPSTREAM_TIMEOUT_MS, 10_000, 'UPSTREAM_TIMEOUT_MS'),
    maxUpstreamBytes: positiveInteger(env.MAX_UPSTREAM_BYTES, 64 * 1024, 'MAX_UPSTREAM_BYTES'),
    trustProxy: env.TRUST_PROXY === 'true' ? 1 : false,
  });
}

module.exports = { loadConfig };
