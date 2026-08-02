# sensei-uaepass

BFF-first UAE PASS session integration for Angular 17.3–20.

The package intentionally does not perform OAuth token exchange in the browser and
does not expose UAE PASS tokens. Configure the three application BFF endpoints:

```ts
provideUaePass({
  loginUrl: '/auth/uae-pass/login',
  sessionUrl: '/api/session',
  logoutUrl: '/auth/logout',
  language: 'en',
});
```

Use the standalone login button:

```html
<uae-pass-login-button />
```

Or inject `UaePassAuthService` and use:

- `login(returnPath?)`
- `restoreSession()`
- `logout()`
- `status()`
- `profile()`
- `isAuthenticated()`
- `error()` and `errorCode()`

The BFF must return the following session contract:

```json
{
  "authenticated": true,
  "profile": {
    "sub": "application-stable-subject",
    "fullnameEN": "Example User"
  },
  "csrfToken": "opaque-csrf-token"
}
```

`csrfToken` is retained only in memory and sent as `X-CSRF-Token` during logout.
Use an opaque `HttpOnly`, `Secure`, intentionally configured `SameSite` application
session cookie.

This project is not certified, approved, or endorsed by UAE PASS.
