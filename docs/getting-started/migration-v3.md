# Migrate to Version 3

Version 3 is intentionally breaking. It removes the browser-token flow.

## Remove

- `clientId`, `redirectUri`, `isProduction`, `scope`, and storage configuration from
  Angular.
- `tokenProxyUrl` and `userInfoProxyUrl`.
- `UaePassCallbackComponent` and the Angular OAuth callback route.
- Browser token/profile persistence and every use of `auth.tokens`.
- Calls to `redirectToAuthorization`, `handleRedirectCallback`, `exchangeToken`, and
  `fetchUserInfo`.

## Configure

```ts
provideUaePass({
  loginUrl: '/auth/uae-pass/login',
  sessionUrl: '/api/session',
  logoutUrl: '/auth/logout',
});
```

## Replace

| Version 2 | Version 3 |
| --- | --- |
| Angular creates PKCE/state | BFF creates state and optional onboarding-approved PKCE |
| Angular callback route | Registered BFF callback |
| Token and user-info proxy | Server-owned OAuth transaction |
| `redirectToAuthorization()` | `login(returnPath?)` |
| `handleRedirectCallback()` | BFF callback endpoint |
| Browser tokens/profile | Opaque cookie and minimized session profile |
| Local browser logout | CSRF-protected BFF invalidation followed by UAE PASS logout |

The reference BFF is under `examples/bff/nodejs-express`.
