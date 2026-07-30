# Angular Demo

Run Angular and the BFF together:

```bash
npm run start:full
```

Before starting, set the required BFF environment values documented in
`examples/bff/nodejs-express/.env.example`.

The demo:

- restores an application session;
- redirects login to the BFF;
- shows only a minimized display name;
- performs CSRF-protected logout;
- contains no OAuth callback route, token display, or browser token storage.
