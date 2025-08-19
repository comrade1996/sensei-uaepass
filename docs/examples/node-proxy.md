# Node Proxy

A proxy is recommended to avoid exposing secrets and to handle CORS.

## Option 1: Quick local proxy

At repo root, a simple proxy is available:

```bash
npm run start:proxy
```

This starts `proxy-server.js` on port 8081 by default. Point `tokenProxyUrl` and `userInfoProxyUrl` to it, e.g. `/api/uae-pass/token` and `/api/uae-pass/userinfo` via your dev server proxy.

## Option 2: Express example

A full Express backend is available in `examples/backends/nodejs-express/`.

- `POST /api/uae-pass/token` — Exchanges code for tokens
- `POST /api/uae-pass/userinfo` — Returns user profile using access token

Configure in `provideUaePass({ tokenProxyUrl, userInfoProxyUrl })`.
