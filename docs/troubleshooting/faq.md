# FAQ

- **Arabic button shows English**
  - Ensure `language: UaePassLanguageCode.Ar` in `provideUaePass(...)`.
  - Do not pass `[language]` to the button unless you need to override.
  - If overriding logos via `buttonLogos`, verify the Arabic path exists.

- **Callback page shows error**
  - Confirm the route `{ path: 'uae-pass/callback', component: UaePassCallbackComponent }` exists.
  - Check redirect URI exactly matches the value registered with UAE PASS.

- **State mismatch (security check failed)**
  - Do not open the callback URL in a new tab or reuse old tabs.
  - Clear site data and retry.

- **CORS or 4xx on token/userinfo**
  - Use a backend proxy and set `tokenProxyUrl`/`userInfoProxyUrl`.
  - Verify server allows your app’s origin.

- **Stuck on loading**
  - Open console and network tabs. Check `authorize` redirect and token exchange calls.
  - Ensure `clientId`, `redirectUri`, and environment (`isProduction`) are correct.
