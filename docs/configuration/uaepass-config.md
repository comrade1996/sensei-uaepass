# Configuration

| Field | Required | Default | Purpose |
| --- | --- | --- | --- |
| `loginUrl` | Yes | — | BFF endpoint that starts login |
| `sessionUrl` | Yes | — | BFF endpoint that returns the application session |
| `logoutUrl` | Yes | — | CSRF-protected BFF logout endpoint |
| `language` | No | `en` | Login-button language (`en` or `ar`) |
| `requestTimeoutMs` | No | `20000` | Session and logout request timeout |
| `autoRestoreSession` | No | `true` | Restore the BFF session when the service starts |
| `buttonLogos` | No | Built-in | English and Arabic button assets |

```ts
provideUaePass({
  loginUrl: 'https://bff.example.com/auth/uae-pass/login',
  sessionUrl: 'https://bff.example.com/api/session',
  logoutUrl: 'https://bff.example.com/auth/logout',
  language: 'ar',
  requestTimeoutMs: 10_000,
});
```

UAE PASS client IDs, secrets, provider endpoints, scopes, redirect URIs, PKCE, and
tokens are BFF configuration and must not appear in Angular configuration.
