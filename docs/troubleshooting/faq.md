# FAQ

## Does Angular need a callback route?

No. The registered callback belongs to the BFF:
`/auth/uae-pass/callback`.

## Where are tokens stored?

Only in the server-side session. They are never returned by `/api/session`.

## Can I use the in-memory session store in production?

No. Production startup rejects it. Configure a shared store using
`SESSION_STORE_MODULE`.

## Why is `isAuthenticated()` false when a session response exists?

An authenticated response must contain a runtime-valid profile with a non-empty
`sub` and a CSRF token.

## Which token client-authentication method should I use?

The published UAE PASS web contract requires HTTP Basic authentication with the
issued client ID and secret. The reference BFF implements that method only.

## Should I enable PKCE?

Only after UAE PASS confirms S256 support for the registered client. The published
web contract does not document PKCE, so the BFF defaults
`UAE_PASS_PKCE_ENABLED=false`.
