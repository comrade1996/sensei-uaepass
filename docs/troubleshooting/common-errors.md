# Common Errors

## `invalid_transaction`

The callback state is missing, expired, already consumed, or not bound to the
initiating session. Start a new login.

## `invalid_token_response`

The provider response lacks a usable bearer token. Confirm the environment and
client-authentication contract.

## `invalid_token_expiry`

The provider did not return a positive finite expiry. The BFF fails closed.

## `origin_rejected` or `csrf_rejected`

Confirm the exact Angular origin allowlist, credentialed request settings, and that
the current CSRF token came from `/api/session`.

## Session is always anonymous

Check cookie `Secure` and `SameSite` behavior, reverse-proxy TLS termination,
`TRUST_PROXY`, the shared store, and browser credentialed requests.
