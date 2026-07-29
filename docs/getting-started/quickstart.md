# Quickstart

## 1. Configure Angular

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

## 2. Add the button

```ts
import { UaePassLoginButtonComponent } from 'sensei-uaepass';

@Component({
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  template: `<uae-pass-login-button />`,
})
export class LoginComponent {}
```

## 3. Run a BFF

Use `examples/bff/nodejs-express` as the reference. The registered UAE PASS redirect
URI must point to the BFF callback, not to an Angular route:

```text
https://bff.example.com/auth/uae-pass/callback
```

The Angular application does not need an OAuth callback route.

## 4. Read session state

```ts
readonly auth = inject(UaePassAuthService);
readonly profile = this.auth.profile;
readonly isAuthenticated = this.auth.isAuthenticated;
```

No browser storage mode or token API exists in version 3.
