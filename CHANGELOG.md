# 🥋 Sensei UAE Pass Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-07-29

### Breaking

- Replace browser-managed OAuth with a server-owned BFF session architecture.
- Replace `clientId`, redirect, environment, storage, token-proxy, and user-info
  configuration with `loginUrl`, `sessionUrl`, and `logoutUrl`.
- Remove the Angular callback component, public token signals, browser PKCE/state
  storage, token persistence, and direct token/user-info methods.

### Security

- Keep all UAE PASS tokens and complete identity responses server-side.
- Add one-time server transactions, session binding and rotation, fixed redirect URI,
  CSRF-protected logout, strict cookies and headers, bounded upstream requests, and
  metadata-only logging.
- Require an explicit provider client-authentication method and a shared production
  session store.
- Add a threat model, data-minimization guidance, CodeQL, an SBOM release artifact,
  signed-tag verification, and commit-pinned GitHub Actions.

### Quality

- Add BFF integration tests for PKCE, replay, session rotation, browser token
  exclusion, CSRF, logout, safe logs, malformed upstream data, and production-store
  enforcement.
- Add CI jobs for Angular 19.2 minimum, latest Angular 19, Angular 20 minimum, and
  latest Angular 20.

## [2.0.0] - 2026-07-27

### Changed

- Require `tokenProxyUrl` and `userInfoProxyUrl`; confidential token and profile requests are backend-only.
- Remove browser `clientSecret` configuration and direct UAE PASS endpoint calls.
- Support Angular 19.2 through Angular 20 with Node.js 22.12 and 24 validation.
- Publish through one tag-driven npm workflow with provenance and package validation.
- Use the GitBook site as the single canonical documentation URL.

### Security

- Fail closed when Web Crypto or session storage is unavailable.
- Generate PKCE and state with unbiased cryptographic randomness.
- Store concurrent PKCE transactions by state, validate callback origin/path, expire transactions, and prevent replay.
- Namespace persisted data per client and reject expired or malformed tokens.
- Add stable `UaePassErrorCode` values and remove production debug logging.

### Quality

- Add authentication, PKCE, storage, configuration, component, Arabic, and accessibility tests.
- Enforce global coverage, ESLint, formatting, documentation lint, build, audit, and package checks in CI.
- Add security, support, contribution, ownership, issue, pull-request, and Dependabot policies.

### Migration

See the [version 2 migration guide](docs/getting-started/migration-v2.md). Remove `clientSecret` from Angular code and configure both required backend endpoints before upgrading.

## [1.0.0] - 2025-08-15

### 🎉 Initial Release

#### Added

- **OAuth 2.0 Integration** - Complete UAE Pass OAuth 2.0 flow support with PKCE
- **Angular 19+ Support** - Built for modern Angular with signals-based state management
- **Standalone Components** - Modern Angular architecture
- **UaePassAuthService** - Core authentication service with reactive signals
- **UaePassCallbackComponent** - Handles OAuth callback with user feedback
- **UaePassLoginButtonComponent** - Ready-to-use login button component
- **Proxy Support** - Built-in configuration for secure token exchange
- **TypeScript Interfaces** - Full type safety for UAE Pass API responses
- **Security Features**:
  - PKCE (Proof Key for Code Exchange) implementation
  - State parameter validation for CSRF protection
  - Secure token storage options (Session/Local/None)
- **Multi-language Support** - Full English and Arabic localization with RTL support
- **Language-Specific UI** - Dynamic button logos and text based on language configuration
- **Elegant Callback UI** - Beautiful loading states, success/error animations, and countdown redirects
- **Localized Error Messages** - All error messages available in English and Arabic
- **GitHub Actions** - CI/CD workflows for NPM publishing and GitHub Pages deployment
- **Comprehensive Documentation** - Detailed setup and usage guides
- **Demo Application** - Complete working example
- **Proxy Server Example** - Node.js/Express proxy for secure token exchange

#### Configuration Options

- `clientId` - UAE Pass application client ID
- `clientSecret` - Optional client secret for confidential clients
- `redirectUri` - OAuth redirect URI
- `isProduction` - Environment selection (staging/production)
- `scope` - OAuth scope configuration
- `language` - UI language (English/Arabic)
- `storage` - Token storage mode
- `buttonLogos` - Language-specific button logos configuration
- `logoutRedirectUri` - Optional logout redirect URI
- `tokenProxyUrl` - Proxy URL for token exchange
- `userInfoProxyUrl` - Proxy URL for user info requests
- `requestTimeoutMs` - HTTP request timeout

#### API Reference

- **Signals**: `status()`, `tokens()`, `profile()`, `error()`, `isAuthenticated()`
- **Methods**: `redirectToAuthorization()`, `handleRedirectCallback()`, `logout()`, `resetError()`

#### Security & Compliance

- Based on official UAE Pass documentation
- PKCE implementation for enhanced security
- State parameter validation
- Secure token lifecycle management
- HTTPS enforcement recommendations

---

## Future Releases

### Planned Features

- Unit tests coverage
- E2E testing examples
- Additional proxy server examples (ASP.NET Core, Python, Java)
- Advanced error handling and retry mechanisms
- Token refresh automation
- Biometric authentication support (when available)
- SSR (Server-Side Rendering) support improvements

---

_Built with sensei-level mastery_ 🥋
