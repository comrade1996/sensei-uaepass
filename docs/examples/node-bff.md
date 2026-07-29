# Node.js/Express BFF

The maintained reference is `examples/bff/nodejs-express`.

It includes:

- server-owned state and onboarding-gated S256 PKCE;
- one-time transactions and concurrent login support;
- fixed provider endpoints and registered redirect URI;
- UAE PASS HTTP Basic client authentication;
- bounded, validated upstream requests;
- server-side token and identity storage;
- opaque secure cookies and session rotation;
- origin and CSRF checks;
- minimized session responses;
- safe structured logs;
- liveness, readiness, rate limits, and graceful shutdown;
- a shared session-store requirement in production.

The published contract is documented in
[UAE PASS Web Contract](../security/uae-pass-contract.md). Client-specific redirect
URIs, scopes, profile attributes, and optional PKCE support still require onboarding
confirmation.
