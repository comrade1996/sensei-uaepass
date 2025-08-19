# Auth Service

Service: `UaePassAuthService` (provided in root)

## Signals

- `status: UaePassAuthStatus` — Idle, Authorizing, ExchangingToken, Authenticated, Error, LoggedOut
- `tokens: UaePassTokens | null`
- `profile: UaePassUserProfile | null`
- `error: string | null`
- `isAuthenticated: boolean`

## Methods

- `redirectToAuthorization(): Promise<void>` — Redirect to UAE PASS
- `handleRedirectCallback(currentUrl?: string): Promise<void>` — Complete OAuth flow
- `logout(): void` — Clear local state and call official logout
- `resetError(): void`

### Advanced

- `buildAuthorizeUrl(): Promise<string>` — Build URL with PKCE/state
- `exchangeToken(code: string): Promise<UaePassTokens>` — Token exchange
- `fetchUserInfo(accessToken: string): Promise<UaePassUserProfile | null>` — Profile fetch

## Usage

```ts
import { inject, Component, effect } from '@angular/core';
import { UaePassAuthService } from 'sensei-uaepass';

@Component({ selector: 'app-example', standalone: true, template: `...` })
export class ExampleComponent {
  auth = inject(UaePassAuthService);

  // react to status
  fx = effect(() => {
    if (this.auth.isAuthenticated()) {
      console.log('Logged in', this.auth.profile());
    }
  });
}
```
