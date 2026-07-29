# Callback, CORS, and State Errors

## `invalid_callback_url`

The callback URL origin or path does not match `redirectUri`. Register and configure the exact same URL. Query parameters may differ, but the origin and path must match.

## `state_mismatch`

The state transaction is missing, malformed, expired, or already used. Common causes are blocked session storage, callbacks opened in another browser context, multiple stale login attempts, or callback replay.

Start a new authentication flow. Do not bypass state validation.

## `crypto_unavailable`

Web Crypto is unavailable. Use a supported secure browser context. Production sites must use HTTPS.

## `storage_unavailable`

Session storage is unavailable or blocked. The PKCE verifier cannot survive the redirect, so authentication stops.

## `token_exchange_failed`

Confirm the backend endpoint is reachable, CORS permits the application origin, server credentials are valid, the authorization code has not been reused, and the redirect URI exactly matches the authorization request.

## Browser CORS errors

The browser should call only your configured backend endpoints. Configure CORS on that backend; do not attempt to call confidential UAE PASS endpoints directly from Angular.
