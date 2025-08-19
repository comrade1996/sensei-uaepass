# Production Checklist

Use this checklist before going live:

- [ ] **HTTPS everywhere** — Ensure your app and proxies use HTTPS
- [ ] **Redirect URIs** — Exact match in UAE PASS tenant and app config
- [ ] **Environment** — `isProduction: true` for production tenants
- [ ] **Proxy endpoints** — Use secure `tokenProxyUrl` & `userInfoProxyUrl`; restrict allowed origins
- [ ] **Secrets** — Do NOT expose `client_secret` in the browser; keep it server-side
- [ ] **Scopes** — Use only required scopes
- [ ] **Storage** — Choose `session` or `local` per requirements; consider `none` for strict security
- [ ] **Logout** — Set `logoutRedirectUri` if different from `redirectUri`
- [ ] **Language** — Verify `language` (en/ar) and UI direction (RTL for Arabic)
- [ ] **Log sanitization** — Avoid logging access tokens or PII
- [ ] **Timeouts** — Tune `requestTimeoutMs` for your infra
- [ ] **CSP** — Configure Content Security Policy to allow UAE PASS endpoints
- [ ] **Monitoring** — Track errors and latency on proxy routes
- [ ] **Rate limiting** — Protect proxy endpoints
- [ ] **Error UX** — Graceful error states on callback and login pages
