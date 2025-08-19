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

4) (Optional) Use the callback component explicitly

```html
<!-- If you want to render and handle events directly -->
<uae-pass-callback (success)="onOk()" (failed)="onErr($event)"></uae-pass-callback>
```

The routed approach (step 2) is typically enough; the component auto-processes the URL and redirects back to `/` on success.

5) Choose a backend proxy (Node or .NET)

- Node: see Examples → [Node Proxy](../examples/node-proxy.md)
- .NET (ASP.NET Core): see Examples → [ASP.NET Core Proxy](../examples/dotnet-proxy.md)

Set `tokenProxyUrl` and `userInfoProxyUrl` in `provideUaePass({ ... })` to point at your backend endpoints.

That’s it. On click, the button redirects to UAE PASS. The callback component completes the flow and restores tokens/profile.
