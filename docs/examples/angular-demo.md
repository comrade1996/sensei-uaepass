# Angular Demo

A demo app is included to showcase the library in `projects/demo/`.

## Run locally

```bash
# 1) Build the library so the demo consumes the latest build
npm run build:lib

# 2) Start the demo app (opens http://localhost:4200)
npm run start:demo

# 3) (Recommended) Start the proxy in a second terminal
npm run start:proxy
```

Ensure your `provideUaePass({...})` in the demo uses your Client ID and redirect URIs.

Key scripts from `package.json`:
- `build:lib` — builds the library
- `start:demo` — serves the demo in production mode
- `start:proxy` — runs `proxy-server.js`

## Callback route

The demo includes a callback route for UAE PASS:

```ts
{ path: 'uae-pass/callback', component: UaePassCallbackComponent }
```

If you change routes, mirror the same redirect URI in your UAE PASS tenant configuration.
