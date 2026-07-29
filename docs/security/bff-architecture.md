# BFF Architecture

The Backend-for-Frontend is the OAuth and identity security boundary.

## Responsibilities

| Angular | BFF |
| --- | --- |
| Render login and session UI | Generate state and optional onboarding-approved S256 PKCE |
| Redirect to BFF login | Store one-time transactions |
| Read minimized session profile | Receive the registered callback |
| Send CSRF token for logout | Exchange codes, call user info, and initiate UAE PASS logout |
| Never handle provider tokens | Validate required identity fields |
| Never persist identity state | Store tokens in the server session |

## Endpoints

- `GET /auth/uae-pass/login`
- `GET /auth/uae-pass/callback`
- `GET /api/session`
- `POST /auth/logout`
- `GET /health/live`
- `GET /health/ready`

The reference implementation uses an opaque `HttpOnly` cookie. Its `SameSite` value
is explicit and `SameSite=None` is rejected unless `Secure` is enabled. Production
requires a shared session store; the in-memory implementation is local-development
only.

## Deployment models

Prefer same-origin deployment through a reverse proxy:

```text
https://app.example.com/             Angular
https://app.example.com/auth/*       BFF
https://app.example.com/api/session  BFF
```

If Angular and the BFF use different origins, configure an exact origin allowlist,
credentialed CORS, cookie attributes, and CSRF behavior for that topology. Never use a
wildcard origin with credentials.
