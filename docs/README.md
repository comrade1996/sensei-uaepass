# UAE PASS Angular Authentication Library

Sensei UAE PASS integrates UAE PASS authentication into Angular 19 and 20 applications using OAuth 2.0 Authorization Code with PKCE, Signals, and standalone UI components.

- 🔐 Fail-closed Web Crypto, PKCE S256, callback URL checks, and per-state CSRF transactions
- 🚀 Angular 19–20 with Signals and standalone components
- 🔧 Validated dependency-injection configuration through `provideUaePass()`
- 🌐 Required backend endpoints for token exchange and user information
- 🖼️ Accessible English and Arabic/RTL login-button support
- 📦 [Install from npm](https://www.npmjs.com/package/sensei-uaepass)
- 💻 [Source and issues](https://github.com/comrade1996/sensei-uaepass)

> This is an independent, community-maintained project and is not affiliated with or endorsed by UAE PASS. Follow the [official UAE PASS documentation](https://docs.uaepass.ae/) for onboarding and production approval.

## Install

```bash
npm install sensei-uaepass
```

Peer dependencies are `@angular/core` and `@angular/common` versions `>=19.2.0 <21.0.0`, plus RxJS 7.8. Provide Angular `HttpClient` in the application.

## Quick Start

Add providers (e.g. `app.config.ts`):

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideUaePass, UaePassLanguageCode, UaePassStorageMode } from 'sensei-uaepass';

export const appConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideUaePass({
      clientId: '<CLIENT_ID>',
      redirectUri: 'http://localhost:4200/uae-pass/callback',
      isProduction: false,
      language: UaePassLanguageCode.Ar,
      storage: UaePassStorageMode.Session,
      tokenProxyUrl: '/api/uae-pass/token',
      userInfoProxyUrl: '/api/uae-pass/userinfo',
      buttonLogos: {
        english: '/assets/UAEPASS_Sign_with_Btn_Outline_Active@2x.svg',
        arabic: '/assets/UAEPASS_Sign_with_Btn_Outline_Active_AR@2x.svg'
      }
    }),
  ]
};
```

Add a callback route:

```ts
import { Routes } from '@angular/router';
import { UaePassCallbackComponent } from 'sensei-uaepass';

export const routes: Routes = [
  { path: 'uae-pass/callback', component: UaePassCallbackComponent },
];
```

Use the login button:

```html
<uae-pass-login-button></uae-pass-login-button>
```

## Security boundary

`tokenProxyUrl` and `userInfoProxyUrl` are required. Never place a UAE PASS client secret in Angular source, runtime configuration, browser storage, or a deployed bundle. Store confidential credentials only in a backend secret manager or environment variable.

## Continue reading

- [Installation](getting-started/installation.md)
- [Quickstart](getting-started/quickstart.md)
- [OAuth 2.0 and PKCE security](security/oauth-pkce.md)
- [Configuration](configuration/uaepass-config.md)
- [Angular compatibility](getting-started/compatibility.md)
- [Version 2 migration](getting-started/migration-v2.md)
- [Login Button](components/login-button.md)
- [Auth Service](services/auth-service.md)
