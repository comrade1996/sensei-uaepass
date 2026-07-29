# Node.js/Express UAE PASS BFF

This is a server-owned Backend-for-Frontend reference implementation. Angular never
receives UAE PASS access, refresh, or ID tokens.

## Boundary

- The BFF creates a server-owned state transaction.
- S256 PKCE is optional because it is not listed in the published UAE PASS web
  contract; enable it only when confirmed during onboarding.
- The BFF receives the registered OAuth callback.
- Tokens and the complete UAE PASS response remain in the server session.
- Angular receives a minimized profile and an opaque `HttpOnly` session cookie.

## Run locally

1. Copy `.env.example` values into your process environment.
2. Set the registered login and logout redirect URIs issued during UAE PASS
   onboarding.
3. Install dependencies with `npm install`.
4. Run `npm start`.

The built-in memory session store is for local development only. Production startup
requires `SESSION_STORE_MODULE`, pointing to a module that exports a shared session
store instance. `src/session-store.js` includes a `RedisSessionStore` adapter for a
node-redis compatible client.

Do not use real identity data or production credentials in local examples or tests.

The token request follows the official UAE PASS web contract: HTTP Basic client
authentication, query parameters, and `multipart/form-data; charset=UTF-8`.
