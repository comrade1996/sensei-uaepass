# Sensei UAE PASS: Angular Authentication Library

[![npm version](https://img.shields.io/npm/v/sensei-uaepass)](https://www.npmjs.com/package/sensei-uaepass)
[![npm downloads](https://img.shields.io/npm/dm/sensei-uaepass)](https://www.npmjs.com/package/sensei-uaepass)
[![CI](https://github.com/comrade1996/sensei-uaepass/actions/workflows/ci.yml/badge.svg)](https://github.com/comrade1996/sensei-uaepass/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/sensei-uaepass)](LICENSE)

A secure UAE PASS authentication library for Angular 19 and 20. It implements OAuth 2.0 Authorization Code with PKCE, Angular Signals, standalone components, Arabic/RTL support, and mandatory backend proxy endpoints for confidential operations.

[Documentation](https://sensei-5.gitbook.io/sensei-uaepass/) · [npm](https://www.npmjs.com/package/sensei-uaepass) · [Issues](https://github.com/comrade1996/sensei-uaepass/issues)

> This is an independent, community-maintained project. It is not affiliated with or endorsed by UAE PASS. Integrations should be validated against the [official UAE PASS documentation](https://docs.uaepass.ae/feature-guides/authentication/web-application).

## Features

- 🔐 **OAuth 2.0 Integration** - Complete UAE Pass OAuth 2.0 flow support with PKCE
- 🚀 **Angular 19–20 Support** - Built for modern Angular with Signals-based state management
- 🌍 **Multi-Language Support** - Full English and Arabic localization with RTL support
- 🎨 **Language-Specific UI** - Dynamic button logos and text based on language
- 🔧 **Easy Configuration** - Simple setup with dependency injection
- 🌐 **Backend-Only Exchange** - Required proxy endpoints keep client secrets and confidential calls off the browser
- 📝 **Comprehensive Types** - Full TypeScript interfaces for UAE Pass API
- 🛡️ **Security First** - Proper PKCE validation and CSRF protection
- 📊 **Signals-Based** - Reactive state management with Angular signals
- 🏛️ **Official Compliance** - Based on official UAE Pass documentation
- 🎌 **Standalone Components** - Modern Angular architecture
- ✨ **Elegant UI** - Beautiful callback component with loading animations

## Installation

```bash
npm install sensei-uaepass
```

## Quick Start

### 1. Configure Services

```typescript
// In app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideUaePass, UaePassLanguageCode, UaePassStorageMode } from 'sensei-uaepass';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideUaePass({
      // UAE Pass Environment URLs
      isProduction: false, // Use staging environment
      // isProduction: true, // Use production environment

      // Your public UAE PASS application configuration
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:4200/uae-pass/callback',
      scope: 'urn:uae:digitalid:profile:general',

      // Language and storage preferences
      language: UaePassLanguageCode.En,
      storage: UaePassStorageMode.Session,

      // Language-specific button logos (optional)
      buttonLogos: {
        english: '/assets/uae-pass-button-en.svg',
        arabic: '/assets/uae-pass-button-ar.svg',
      },

      // Required backend endpoints; never put a client secret in Angular code
      tokenProxyUrl: '/api/uae-pass/token',
      userInfoProxyUrl: '/api/uae-pass/userinfo',
    }),
  ],
};
```

### 2. Add Routes

```typescript
// In app.routes.ts
import { Routes } from '@angular/router';
import { UaePassCallbackComponent } from 'sensei-uaepass';

export const routes: Routes = [
  // Your other routes...
  { path: 'uae-pass/callback', component: UaePassCallbackComponent },
];
```

### 3. Use the Login Button

```html
<!-- In your component template -->
<uae-pass-login-button [language]="'en'" (pressed)="onLoginPressed()"></uae-pass-login-button>

<!-- For Arabic -->
<uae-pass-login-button [language]="'ar'" (pressed)="onLoginPressed()"></uae-pass-login-button>

<!-- With custom image -->
<uae-pass-login-button
  [customImageSrc]="'/assets/custom-logo.svg'"
  (pressed)="onLoginPressed()"
></uae-pass-login-button>
```

### 4. Handle Authentication in Component

```typescript
// In your component
import { Component, inject } from '@angular/core';
import { UaePassAuthService, UaePassAuthStatus } from 'sensei-uaepass';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  template: `
    @if (auth.status() === Status.Authenticated) {
      <div class="user-info">
        <h2>Welcome, {{ auth.profile()?.fullnameEN }}!</h2>
        <p>Emirates ID: {{ auth.profile()?.idn }}</p>
        <button (click)="logout()">Logout</button>
      </div>
    } @else {
      <uae-pass-login-button (pressed)="login()"></uae-pass-login-button>
    }
  `,
})
export class HomeComponent {
  private readonly auth = inject(UaePassAuthService);
  readonly Status = UaePassAuthStatus;

  async login(): Promise<void> {
    await this.auth.redirectToAuthorization();
  }

  logout(): void {
    this.auth.logout();
  }
}
```

## Configuration Options

| Property            | Type                | Required | Description                                                            |
| ------------------- | ------------------- | -------- | ---------------------------------------------------------------------- |
| `clientId`          | string              | Yes      | Your UAE Pass application client ID (from onboarding)                  |
| `redirectUri`       | string              | Yes      | Redirect URI after authentication (must be registered)                 |
| `isProduction`      | boolean             | No       | Use production environment (default: false)                            |
| `scope`             | string              | No       | OAuth scope (default: "urn:uae:digitalid:profile:general")             |
| `language`          | UaePassLanguageCode | No       | UI language (En/Ar, default: En)                                       |
| `storage`           | UaePassStorageMode  | No       | Token storage mode (Session/Local/None, default: None)                 |
| `buttonLogos`       | object              | No       | Language-specific button logos (`{english?: string, arabic?: string}`) |
| `logoutRedirectUri` | string              | No       | Redirect URI after logout (defaults to redirectUri)                    |
| `tokenProxyUrl`     | string              | Yes      | Backend endpoint for confidential token exchange                       |
| `userInfoProxyUrl`  | string              | Yes      | Backend endpoint for user information requests                         |
| `requestTimeoutMs`  | number              | No       | HTTP timeout in milliseconds (default: 20000)                          |

## UAE Pass Environments

### Staging Environment

- **URL**: `https://stg-id.uaepass.ae`
- **Purpose**: Testing and development
- **Configuration**: `isProduction: false`

### Production Environment

- **URL**: `https://id.uaepass.ae`
- **Purpose**: Live applications
- **Configuration**: `isProduction: true`

## Proxy Server Setup

### Why Use a Proxy Server?

A backend proxy is **required**. The Angular package never accepts or sends a UAE PASS client secret:

1. **Client Secret Protection** - Keeps your client secret secure on the server-side
2. **CORS Handling** - Avoids cross-origin issues with UAE Pass APIs
3. **Token Security** - Prevents exposure of sensitive tokens in browser
4. **Request Validation** - Adds an extra layer of validation

### Backend Alternatives

You can replace the proxy server with any backend technology:

#### Node.js/Express Example

```javascript
const express = require('express');
const fetch = require('node-fetch');

app.post('/api/uae-pass/token', async (req, res) => {
  const { code, redirect_uri, code_verifier } = req.body;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret',
    code,
    redirect_uri,
    code_verifier,
  });

  const response = await fetch('https://stg-id.uaepass.ae/idshub/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    var client = new HttpClient();
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

#### Python/FastAPI Example

```python
from fastapi import FastAPI
import httpx

@app.post("/api/uae-pass/token")
async def exchange_token(request: TokenRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://stg-id.uaepass.ae/idshub/token",
            data={
                "grant_type": "authorization_code",
                "client_id": "your-client-id",
                "client_secret": "your-client-secret",
                "code": request.code,
                "redirect_uri": request.redirect_uri,
                "code_verifier": request.code_verifier
            }
        )
        return response.json()
```

## Service API Reference

### UaePassAuthService

#### Signals (Reactive State)

- `status(): Signal<UaePassAuthStatus>` - Current authentication status
- `tokens(): Signal<UaePassTokens|null>` - Access and refresh tokens
- `profile(): Signal<UaePassUserProfile|null>` - User profile information
- `error(): Signal<string|null>` - Last error message
- `errorCode(): Signal<UaePassErrorCode|null>` - Stable machine-readable error code
- `isAuthenticated(): Signal<boolean>` - Computed authentication state

#### Methods

- `redirectToAuthorization(): Promise<void>` - Redirect to UAE Pass login
- `handleRedirectCallback(url?: string): Promise<void>` - Handle callback from UAE Pass
- `logout(): void` - Logout and clear session
- `resetError(): void` - Clear error state

## Authentication Flow

1. **Authorization Request** → User clicks login, redirected to UAE Pass
2. **User Authentication** → User authenticates with UAE Pass
3. **Authorization Code** → UAE Pass returns code to your callback
4. **Token Exchange** → Exchange code for access token (via proxy)
5. **User Information** → Retrieve user profile with access token
6. **Session Management** → Store tokens and profile in configured storage

## TypeScript Interfaces

### UaePassTokens

```typescript
interface UaePassTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}
```

### UaePassUserProfile

```typescript
interface UaePassUserProfile {
  sub: string; // Subject identifier
  uuid: string; // User UUID
  userType: string; // User type (e.g., "SOP3")
  idn: string; // Emirates ID number
  firstnameEN: string; // First name in English
  lastnameEN: string; // Last name in English
  fullnameEN: string; // Full name in English
  firstnameAR: string; // First name in Arabic
  lastnameAR: string; // Last name in Arabic
  fullnameAR: string; // Full name in Arabic
  email: string; // Email address
  mobile: string; // Mobile phone number
  gender: string; // Gender
  nationalityEN: string; // Nationality in English
  nationalityAR: string; // Nationality in Arabic
}
```

## Enums

### UaePassAuthStatus

- `Idle` - Initial state
- `Authorizing` - Redirecting to UAE Pass
- `ExchangingToken` - Exchanging code for token
- `Authenticated` - Successfully authenticated
- `Error` - Authentication error occurred
- `LoggedOut` - User logged out

### UaePassStorageMode

- `None` - No persistence
- `Session` - Session storage (default)
- `Local` - Local storage

### UaePassLanguageCode

- `En` - English (default)
- `Ar` - Arabic

## Security Considerations

1. **PKCE Implementation** - Uses Proof Key for Code Exchange for security
2. **State Validation** - Prevents CSRF attacks with state parameter
3. **Explicit Storage** - Persistence defaults to none; session/local storage must be selected deliberately
4. **Expiry Enforcement** - Expired persisted access tokens are rejected during restoration
5. **HTTPS Only** - Production applications and backend endpoints must use HTTPS
6. **Backend Boundary** - Client secrets and confidential token operations remain server-side

## Error Handling

The service provides comprehensive error handling:

```typescript
// Subscribe to authentication status
effect(() => {
  const status = this.auth.status();
  const error = this.auth.error();

  if (status === UaePassAuthStatus.Error && error) {
    console.error('Authentication failed:', error);
    // Handle error (show notification, redirect, etc.)
  }
});
```

## Demo Application

A complete demo application is included:

```bash
# Build the library
npm run build:lib

# Start the demo
npm run start:demo

# Start the proxy server (in another terminal)
node proxy-server.js
```

## Getting Started with UAE Pass

1. **Onboarding** - Complete UAE Pass onboarding process
2. **Credentials** - Receive client ID and secret
3. **Registration** - Register your redirect URIs
4. **Testing** - Test in staging environment
5. **Assessment** - Complete UAE Pass assessment
6. **Production** - Go live with production credentials

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Security reports must follow [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License.

## Support

Use [GitHub Issues](https://github.com/comrade1996/sensei-uaepass/issues) for reproducible bugs. See the [troubleshooting guide](https://sensei-5.gitbook.io/sensei-uaepass/troubleshooting/faq) for support boundaries and common issues.

## Resources

- 📖 [Complete Documentation](https://sensei-5.gitbook.io/sensei-uaepass/)
- 🔗 [NPM Package](https://www.npmjs.com/package/sensei-uaepass)
- 📚 [Official UAE Pass Documentation](https://docs.uaepass.ae/)
- 🚀 [UAE Pass Onboarding Guide](https://docs.uaepass.ae/getting-onboarded-with-uaepass)
- 🧪 [UAE Pass Staging Environment](https://docs.uaepass.ae/quick-start-guide-uaepass-staging-environment)
