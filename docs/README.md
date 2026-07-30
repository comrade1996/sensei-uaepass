# Sensei UAE PASS Documentation

The supported architecture is BFF-first:

1. Angular redirects to `GET /auth/uae-pass/login`.
2. The BFF generates state, adds onboarding-approved PKCE when enabled, and redirects
   to UAE PASS.
3. UAE PASS calls the registered BFF callback.
4. The BFF exchanges the code, validates identity, and stores tokens server-side.
5. Angular reads a minimized identity from `GET /api/session`.

Start with the [quickstart](getting-started/quickstart.md) and [BFF
architecture](security/bff-architecture.md).

This community project is not certified, approved, or endorsed by UAE PASS.
