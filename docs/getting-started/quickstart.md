# Quickstart

1) Provide configuration (e.g. `app.config.ts`):

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
      language: UaePassLanguageCode.Ar, // auto-Arabic UI
      storage: UaePassStorageMode.Session,
      tokenProxyUrl: '/api/uae-pass/token',
      userInfoProxyUrl: '/api/uae-pass/userinfo',
    })
  ]
};
```

2) Add a callback route:

```ts
import { Routes } from '@angular/router';
import { UaePassCallbackComponent } from 'sensei-uaepass';

export const routes: Routes = [
  { path: 'uae-pass/callback', component: UaePassCallbackComponent },
];
```

3) Drop the login button:

```html
<uae-pass-login-button></uae-pass-login-button>
```

That’s it. On click, the button redirects to UAE PASS. The callback component completes the flow and restores tokens/profile.
