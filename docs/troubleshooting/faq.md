# FAQ

## Does Angular need a callback route?

No. The registered callback belongs to the BFF:
`/auth/uae-pass/callback`. The BFF receives the OAuth callback, exchanges the code,
and redirects the browser back to Angular with an opaque session cookie.

## Where are tokens stored?

Only in the server-side session. They are never returned by `/api/session`. The
browser receives an opaque `HttpOnly` cookie and a minimized profile.

## Can I use the in-memory session store in production?

No. Production startup rejects it. Configure a shared store using
`SESSION_STORE_MODULE`, pointing to a module that exports a store instance with
`get`, `set`, and `delete` methods.

```bash
SESSION_STORE_MODULE=./stores/redis-store.js
```

## Why is `isAuthenticated()` false when a session response exists?

An authenticated response must contain a runtime-valid profile with a non-empty
`sub` and a CSRF token. The service validates the response shape:

```ts
function isSessionResponse(value): boolean {
  // authenticated must be boolean
  // if authenticated: profile.sub must be non-empty string, csrfToken must be non-empty
  // if not authenticated: profile must be null/undefined
}
```

## Which token client-authentication method should I use?

The published UAE PASS web contract requires HTTP Basic authentication with the
issued client ID and secret. The reference BFF implements that method only.

## Should I enable PKCE?

Only after UAE PASS confirms S256 support for the registered client. The published
web contract does not document PKCE, so the BFF defaults
`UAE_PASS_PKCE_ENABLED=false`.

## How do I handle login cancellation?

When the user cancels at the UAE PASS login page, the BFF callback receives an `error`
query parameter and redirects to `/?auth=cancelled`. Angular's session restoration
will find no session and set status to `Idle`.

## Can I deploy Angular and the BFF on different origins?

Yes, but you must configure:
- An exact origin allowlist (`ALLOWED_ORIGINS`)
- Credentialed CORS
- Cookie `SameSite` and `Secure` attributes matching the topology
- Never use `*` with credentials

Same-origin deployment through a reverse proxy is recommended.

## How do I rotate the session cookie?

Session rotation happens automatically on every successful login. The BFF deletes the
old session ID and creates a new one with a fresh opaque identifier.

## What happens when the session expires?

The BFF checks `tokenExpiresAt` on every `/api/session` call. If expired, it deletes
the session, clears the cookie, and returns `{ authenticated: false, profile: null }`.
Angular sets status to `Idle`.
