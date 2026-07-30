# Sensei UAE PASS for Angular

`sensei-uaepass` is a BFF-first Angular session client for UAE PASS integrations.
The Angular package handles session UI and state; your Backend-for-Frontend owns
OAuth transactions, tokens, identity validation, and logout.

> This community package is designed with reference to published UAE PASS
> documentation. It is not certified, approved, or endorsed by UAE PASS. Each
> service provider must complete its own onboarding and security approval.

## Architecture

```text
Angular                         Application BFF                    UAE PASS
   | GET /auth/uae-pass/login       |                                 |
   |------------------------------->| create state transaction        |
   |                                | redirect authorize ------------>|
   |                                |<------------- code + state -----|
   |                                | validate/consume transaction     |
   |                                | exchange code + fetch user info  |
   |                                | keep all tokens server-side      |
   |<-- opaque HttpOnly cookie -----|                                 |
   | GET /api/session               |                                 |
   |<-- minimized profile ----------|                                 |
```

The browser never receives UAE PASS access, refresh, or ID tokens.

## Install

```bash
npm install sensei-uaepass
```

## Angular setup

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideUaePass } from 'sensei-uaepass';

export const appConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideUaePass({
      loginUrl: '/auth/uae-pass/login',
      sessionUrl: '/api/session',
      logoutUrl: '/auth/logout',
      language: 'en',
    }),
  ],
};
```

Use the standalone button:

```ts
import { Component } from '@angular/core';
import { UaePassLoginButtonComponent } from 'sensei-uaepass';

@Component({
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  template: `<uae-pass-login-button />`,
})
export class LoginComponent {}
```

Read the application session:

```ts
import { Component, inject } from '@angular/core';
import { UaePassAuthService } from 'sensei-uaepass';

@Component({ standalone: true, template: `{{ auth.profile()?.fullnameEN }}` })
export class AccountComponent {
  readonly auth = inject(UaePassAuthService);
}
```

Available state:

- `status()` — session lifecycle status
- `profile()` — minimized application profile from the BFF
- `isAuthenticated()` — true only for a validated session identity
- `error()` and `errorCode()` — safe client-side failure information

Available actions:

- `login(returnPath?)`
- `restoreSession()`
- `logout()`
- `resetError()`

## BFF

The reference implementation is in
[`examples/bff/nodejs-express`](examples/bff/nodejs-express/README.md).

Required server configuration includes UAE PASS credentials, registered login and
logout redirect URIs, application origin, secure cookie policy, and a production
shared session store.

For local development:

```powershell
$env:NODE_ENV='development'
$env:APP_ORIGIN='http://localhost:4200'
$env:ALLOWED_ORIGINS='http://localhost:4200'
$env:UAE_PASS_ENVIRONMENT='staging'
$env:UAE_PASS_CLIENT_ID='your-staging-client-id'
$env:UAE_PASS_CLIENT_SECRET='your-staging-client-secret'
$env:UAE_PASS_REDIRECT_URI='http://localhost:3001/auth/uae-pass/callback'
$env:UAE_PASS_LOGOUT_REDIRECT_URI='http://localhost:4200'
npm run start:full
```

The implementation follows the published HTTP Basic token contract. Enable
`UAE_PASS_PKCE_ENABLED=true` only when UAE PASS confirms S256 support for your
onboarded client.

## Security properties

- OAuth state is generated and stored by the BFF; S256 PKCE is available when
  confirmed for the onboarded UAE PASS client.
- Callback transactions are short-lived and consumed once.
- Redirect URI and provider endpoints are server-owned.
- Tokens and complete UAE PASS profiles remain server-side.
- Login rotates the opaque session identifier.
- Logout requires an allowed origin and in-memory CSRF token.
- Logs contain correlation and operational metadata, not tokens or identity payloads.
- Production refuses the development-only in-memory session store.

See the [confirmed UAE PASS web contract](docs/security/uae-pass-contract.md),
[production checklist](docs/deployment/production-checklist.md), [threat
model](docs/security/threat-model.md), and [version 3 migration
guide](docs/getting-started/migration-v3.md).

## Development

```bash
npm ci
npm test
npm run build
npm run validate
```

Angular 19.2 through Angular 20 are supported. Node.js 22.12 or newer is required.

## License

MIT
