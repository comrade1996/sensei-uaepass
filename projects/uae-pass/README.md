# 🥋 Sensei UAE Pass

Master of UAE Pass integration! Angular OAuth 2.0 (PKCE) client with sensei-level signals-based state management and standalone components.

**Based on official UAE Pass documentation**: [https://docs.uaepass.ae/feature-guides/authentication/web-application](https://docs.uaepass.ae/feature-guides/authentication/web-application)

## Features

- 🔐 **OAuth 2.0 Integration** - Complete UAE Pass OAuth 2.0 flow support with PKCE
- 🚀 **Angular 19+ Support** - Built for modern Angular with signals-based state management
- 🔧 **Easy Configuration** - Simple setup with dependency injection
- 🌐 **Proxy Support** - Built-in proxy configuration for secure token exchange
- 📝 **Comprehensive Types** - Full TypeScript interfaces for UAE Pass API
- 🛡️ **Security First** - Proper PKCE validation and CSRF protection
- 📊 **Signals-Based** - Reactive state management with Angular signals
- 🏛️ **Official Compliance** - Based on official UAE Pass documentation
- 🎌 **Standalone Components** - Modern Angular architecture

## Install

```bash
npm install sensei-uaepass
```

Peer deps: `@angular/core`, `@angular/common`, `rxjs`. Ensure HttpClient is provided in your app.

## Provide configuration

Add the provider to your application (e.g. `app.config.ts`).

```ts
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideUaePass, UaePassLanguageCode, UaePassStorageMode } from "sensei-uaepass";

export const appConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideUaePass({
      clientId: "<CLIENT_ID>",
      redirectUri: "https://your.app/uae-pass/callback",
      isProduction: false,
      language: UaePassLanguageCode.En,
      scope: "urn:uae:digitalid:profile:general",
      tokenProxyUrl: "/api/uae-pass/token", // recommended
      userInfoProxyUrl: "/api/uae-pass/userinfo",
      storage: UaePassStorageMode.Session,
    }),
  ],
};
```

## Add routes

```ts
import { Routes } from "@angular/router";
import { UaePassCallbackComponent } from "sensei-uaepass";

export const routes: Routes = [
  // ...
  { path: "uae-pass/callback", component: UaePassCallbackComponent },
];
```

## Use the login button

```html
<uae-pass-login-button [label]="'Sign in with UAE PASS'" [busyLabel]="'Signing in…'" [logoSrc]="'/assets/uae-pass.svg'" (pressed)="onPressed()"></uae-pass-login-button>
```

The button calls `redirectToAuthorization()` for you. Alternatively, inject `UaePassAuthService` and call it directly.

## Handle callback result (optional)

`UaePassCallbackComponent` emits outputs you can use to react:

```html
<uae-pass-callback (success)="onLogin()" (failed)="onLoginError($event)"></uae-pass-callback>
```

You can also handle programmatically:

```ts
constructor(private auth: UaePassAuthService) {}
ngOnInit() { this.auth.handleRedirectCallback(); }
```

## Service API

### Signals (Reactive State)

- `status(): Signal<UaePassAuthStatus>` - Current authentication status
- `tokens(): Signal<UaePassTokens|null>` - Access and refresh tokens
- `profile(): Signal<UaePassUserProfile|null>` - User profile information
- `error(): Signal<string|null>` - Last error message
- `isAuthenticated(): Signal<boolean>` - Computed authentication state

### Methods

- `redirectToAuthorization(): Promise<void>` - Redirect to UAE Pass login
- `handleRedirectCallback(url?: string): Promise<void>` - Handle callback from UAE Pass
- `logout(): void` - Logout and clear session
- `resetError(): void` - Clear error state

## Proxy Server Setup

### Why Use a Proxy Server?

The proxy server is **highly recommended** for security reasons:

1. **Client Secret Protection** - Keeps your client secret secure on the server-side
2. **CORS Handling** - Avoids cross-origin issues with UAE Pass APIs
3. **Token Security** - Prevents exposure of sensitive tokens in browser
4. **Request Validation** - Adds an extra layer of validation

### Backend Alternatives

You can replace the proxy server with any backend technology:

#### Node.js/Express Example

```javascript
app.post("/api/uae-pass/token", async (req, res) => {
  const { code, redirect_uri, code_verifier } = req.body;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "your-client-id",
    client_secret: "your-client-secret",
    code,
    redirect_uri,
    code_verifier,
  });

  const response = await fetch("https://stg-id.uaepass.ae/idshub/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await response.json();
  res.json(data);
});
```

#### ASP.NET Core Example

```csharp
[HttpPost("api/uae-pass/token")]
public async Task<IActionResult> ExchangeToken([FromBody] TokenRequest request)
{
    var parameters = new Dictionary<string, string>
    {
        ["grant_type"] = "authorization_code",
        ["client_id"] = "your-client-id",
        ["client_secret"] = "your-client-secret",
        ["code"] = request.Code,
        ["redirect_uri"] = request.RedirectUri,
        ["code_verifier"] = request.CodeVerifier
    };

    var content = new FormUrlEncodedContent(parameters);
    var response = await client.PostAsync("https://stg-id.uaepass.ae/idshub/token", content);
    var result = await response.Content.ReadAsStringAsync();

    return Ok(JsonSerializer.Deserialize<object>(result));
}
```

## Notes

- For security, prefer a backend proxy for the token exchange (`tokenProxyUrl`), to avoid exposing client secrets and to handle CORS.
- `storage: UaePassStorageMode.Session | Local | None` controls persistence of tokens/profile across reloads.
- `acr_values` defaults to web flow in browsers.

## Demo

A demo application is included in this workspace to showcase the library:

```bash
# Build the library first
npm run build:lib

# Start the demo app
npm run start:demo

# Start the proxy server (in another terminal)
node proxy-server.js
```

The demo shows:

- UAE Pass login button with enum-based configuration
- Real-time authentication status display
- User profile and token information
- Proper routing with callback handling

### Demo Configuration

The demo uses staging environment with these settings:

- `clientId: 'sandbox_stage'`
- `redirectUri: 'http://localhost:4200/uae-pass/callback'`
- `language: UaePassLanguageCode.En`
- `storage: UaePassStorageMode.Session`

## Enums

All commonly used string unions are exposed as enums for type safety:

- `UaePassAuthStatus` — Idle, Authorizing, ExchangingToken, Authenticated, Error, LoggedOut
- `UaePassStorageMode` — None, Session, Local
- `UaePassAcr` — Web, MobileOnDevice
- `UaePassLanguageCode` — En, Ar
- `OAuthResponseType` — Code
- `CodeChallengeMethod` — S256
- `OAuthGrantType` — AuthorizationCode

## Resources

- 📖 [Complete Documentation](https://sensei-5.gitbook.io/sensei-uaepass/)
- 🔗 [NPM Package](https://www.npmjs.com/package/sensei-uaepass)
- 📚 [Official UAE Pass Documentation](https://docs.uaepass.ae/)
- 🚀 [UAE Pass Onboarding Guide](https://docs.uaepass.ae/getting-onboarded-with-uaepass)
