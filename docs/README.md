# 🥋 Sensei UAE Pass (Angular)

Angular OAuth 2.0 (PKCE) client with signals-based state and standalone components. Built for Angular 19+, secure by default, and simple to integrate.

- 🔐 OAuth 2.0 + PKCE
- 🚀 Angular 19+ with Signals
- 🔧 DI-based configuration: `provideUaePass()`
- 🌐 Proxy-friendly (`tokenProxyUrl`, `userInfoProxyUrl`)
- 🖼️ Auto Arabic/English button with optional overrides

## Install

```bash
npm install sensei-uaepass
```

Peer deps: `@angular/core`, `@angular/common`, `rxjs`. Ensure HttpClient is provided.

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

More details:
- Configuration: `configuration/uaepass-config.md`
- Login Button: `components/login-button.md`
- Auth Service: `services/auth-service.md`
