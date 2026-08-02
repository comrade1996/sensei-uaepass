# BFF Architecture

The Backend-for-Frontend (BFF) is the OAuth and identity security boundary. It owns
all server-side interactions with UAE PASS.

## Architecture diagram

```mermaid
graph TB
    subgraph Browser["Angular (Browser)"]
        UI["Login Button Component"]
        State["Auth Service (Signals)"]
        UI --> State
    end

    subgraph BFF["Application BFF (Server)"]
        Login["GET /auth/uae-pass/login"]
        Callback["GET /auth/uae-pass/callback"]
        Session["GET /api/session"]
        Logout["POST /auth/logout"]
        Client["UAE PASS Client"]
        Store["Session Store"]
        Login --> Client
        Callback --> Client
        Client --> Store
        Session --> Store
        Logout --> Store
    end

    subgraph UAE["UAE PASS (Provider)"]
        Authorize["/idshub/authorize"]
        Token["/idshub/token"]
        UserInfo["/idshub/userinfo"]
        UAELogout["/idshub/logout"]
    end

    State -- "redirect" --> Login
    Login -- "redirect" --> Authorize
    Authorize -- "callback" --> Callback
    Callback -- "exchange code" --> Token
    Callback -- "fetch profile" --> UserInfo
    State -- "fetch session" --> Session
    State -- "logout" --> Logout
    Logout -- "redirect" --> UAELogout
```

## Responsibility split

| Angular (Browser) | BFF (Server) |
| --- | --- |
| Render login and session UI | Generate state and optional onboarding-approved S256 PKCE |
| Redirect to BFF login | Store one-time transactions |
| Read minimized session profile | Receive the registered callback |
| Send CSRF token for logout | Exchange codes, call user info, and initiate UAE PASS logout |
| Never handle provider tokens | Validate required identity fields |
| Never persist identity state | Store tokens in the server session |

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/auth/uae-pass/login` | Start login, redirect to UAE PASS |
| `GET` | `/auth/uae-pass/callback` | Receive OAuth callback, exchange code |
| `GET` | `/api/session` | Return minimized session profile |
| `POST` | `/auth/logout` | CSRF-protected session invalidation |
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe |

## Cookie policy

The reference implementation uses an opaque `HttpOnly` cookie:

| Attribute | Default | Notes |
| --- | --- | --- |
| `HttpOnly` | Always | Prevents JavaScript access |
| `Secure` | `true` in production | Requires HTTPS |
| `SameSite` | `Lax` | `None` requires `Secure` |
| `Path` | `/` | — |
| `Max-Age` | `sessionTtlMs / 1000` | Default 8 hours |

`SameSite=None` is rejected unless `Secure` is enabled.

## Session store

| Store | Use case |
| --- | --- |
| `MemorySessionStore` | Local development only — production startup rejects it |
| `RedisSessionStore` | Production — adapter for `node-redis` compatible client |

Production requires `SESSION_STORE_MODULE` pointing to a module that exports a shared
session store instance.

## Deployment models

### Same-origin (recommended)

```mermaid
graph LR
    Browser["Browser"] --> Proxy["Reverse Proxy"]
    Proxy --> Angular["Angular :4200"]
    Proxy --> BFF["BFF :3001"]
    BFF --> UAE["UAE PASS"]
```

```text
https://app.example.com/             Angular
https://app.example.com/auth/*       BFF
https://app.example.com/api/session  BFF
```

### Cross-origin

If Angular and the BFF use different origins, configure:

- An exact origin allowlist (never `*` with credentials)
- Credentialed CORS (`Access-Control-Allow-Credentials: true`)
- Cookie attributes matching the topology
- CSRF behavior for cross-origin requests

```mermaid
graph LR
    Browser["Browser"] --> Angular["https://app.example.com"]
    Browser --> BFF["https://bff.example.com"]
    BFF --> UAE["UAE PASS"]
```

> Never use a wildcard origin with credentials.
