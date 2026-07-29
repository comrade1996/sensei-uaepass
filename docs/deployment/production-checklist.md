# Production Checklist

- [x] Match the published UAE PASS web endpoints and HTTP Basic token contract.
- [ ] Complete UAE PASS onboarding and confirm client-specific scopes, login and
      logout redirect URIs, `acr_values`, profile attributes, and PKCE support.
- [ ] Deploy Angular and the BFF behind HTTPS, preferably on one origin.
- [ ] Use an exact origin allowlist; never combine credentialed CORS with `*`.
- [ ] Use a shared, encrypted-at-rest session store with expiry and operational
      monitoring.
- [ ] Configure `HttpOnly`, `Secure`, bounded-lifetime cookies and an intentional
      `SameSite` policy.
- [ ] Validate reverse-proxy and trusted-proxy settings.
- [ ] Keep client secrets and session-store credentials in a managed secret store.
- [ ] Test secret rotation and application-session invalidation.
- [ ] Confirm state transactions are short-lived and one-time-use.
- [ ] Enable S256 PKCE only when UAE PASS confirms support for the registered client.
- [ ] Confirm callback, token, and user-info requests use bounded timeouts and sizes.
- [ ] Confirm `/api/session` returns only approved minimum profile fields.
- [ ] Confirm logs contain no codes, tokens, cookies, Emirates IDs, or profile
      payloads.
- [ ] Exercise login, cancellation, concurrent attempts, callback replay, session
      expiry, logout, provider failure, and store failure in staging.
- [ ] Separate liveness and readiness monitoring.
- [ ] Enable branch protection, dependency review, CodeQL, secret scanning, and
      signed release tags.
- [ ] Review the threat model and obtain independent security approval.
