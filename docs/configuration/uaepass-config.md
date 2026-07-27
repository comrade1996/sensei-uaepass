# UAE Pass Config

Interface: `UaePassConfig` from `projects/uae-pass/src/lib/uae-pass.config.ts`.

- `clientId: string` — UAE PASS client ID.
- `redirectUri: string` — Your app’s redirect URL.
- `isProduction: boolean` — Targets prod vs staging endpoints.
- `language?: 'en' | 'ar' | UaePassLanguageCode` — Default UI language; used in `ui_locales`.
- `scope?: string` — Default: `urn:uae:digitalid:profile:general`.
- `tokenProxyUrl: string` — Required backend endpoint to exchange code for tokens.
- `userInfoProxyUrl: string` — Required backend endpoint to fetch profile.
- `requestTimeoutMs?: number` — Request timeout (ms). Default: 20000.
- `storage?: UaePassStorageMode | 'none'|'session'|'local'` — Token/profile persistence. Default: `'none'`.
- `blockSOP1?: boolean` — Display-only toggle for SOP1 messaging.
- `serviceProviderEnglishName?: string` — Optional display name.
- `serviceProviderArabicName?: string` — Optional display name.
- `logoutRedirectUri?: string` — Optional; else uses `redirectUri`.
- `buttonLogos?: { english?: string; arabic?: string }` — Override button images.

Provide via DI:

```ts
import { provideUaePass } from 'sensei-uaepass';

provideUaePass({
  clientId: '<CLIENT_ID>',
  redirectUri: 'https://app.example.com/uae-pass/callback',
  isProduction: false,
  tokenProxyUrl: '/api/uae-pass/token',
  userInfoProxyUrl: '/api/uae-pass/userinfo',
})
```
