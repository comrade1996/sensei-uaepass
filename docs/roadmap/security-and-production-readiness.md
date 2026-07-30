# Security and Production-Readiness Enhancement Plan

**Status:** Implemented in the version 3 redesign; external assurance gates pending

**Baseline:** `sensei-uaepass` 2.0.0

**Source:** Full security and production-readiness review dated July 29, 2026

The legacy paths named in the phase descriptions are retained here as review history.
The completed implementation removed them and consolidated the maintained server
example under `examples/bff/nodejs-express`.

## Outcome

Move the package from a browser-token architecture to a Backend-for-Frontend (BFF)
architecture in which:

- UAE PASS authorization transactions, tokens, and full identity responses remain on
  the server.
- Angular receives only a secure application-session cookie and the minimum profile
  fields required by the application.
- `isAuthenticated` means that the server has established a valid application
  session and verified the required identity attributes.
- Documentation and examples make a clear distinction between development samples
  and production-ready architecture.

The current Express implementation must not be recommended for production until the
BFF milestone is complete.

## Key Decisions

1. Make the BFF session flow the primary API in the next major release.
2. Treat the existing token-mediating flow as a temporary compatibility path, not as
   the target architecture.
3. Do not pass UAE PASS access, refresh, or ID tokens to Angular in the BFF flow.
4. Keep `storage: none` as the only recommended browser configuration while the
   compatibility API exists.
5. Use the published and Postman-confirmed UAE PASS token contract: HTTP Basic
   authentication, query parameters, and an empty multipart request body. Continue
   to confirm client-specific scopes, redirect URIs, attributes, and optional PKCE
   support during onboarding.
6. Do not claim certification, endorsement, or production readiness without evidence
   from the relevant review and onboarding process.

## Delivery Sequence

### Phase 0: Contain the Current Risk

**Release target:** 2.0.1 security and documentation patch

**Priority:** Immediate

**Estimated effort:** Small

This phase does not make the existing backend production-ready. It prevents users
from mistaking it for a secure BFF while the replacement is built.

#### Work

- Replace all "production-ready", "prevents token exposure", and "Official
  Compliance" claims with accurate language in:
  - `README.md`
  - `projects/uae-pass/README.md`
  - `examples/backends/README.md`
  - `docs/index.html`
  - `docs/security/backend-proxy.md`
  - `docs/examples/node-proxy.md`
- Label both `proxy-server.js` and
  `examples/backends/nodejs-express/server.js` as development-only,
  token-mediating examples.
- Remove logging of authorization codes, tokens, token responses, upstream response
  bodies, and UAE PASS profiles.
- Remove fallback credentials. Refuse to start when required credentials,
  environment values, or the registered redirect URI are missing or invalid.
- Use a fixed, server-owned redirect URI rather than trusting a value supplied by
  the browser.
- Add explicit JSON and form body-size limits.
- Replace the Emirates ID quick-start display with a lower-risk field.
- Correct every storage description to:
  - Default and recommended: `none`
  - `session`: XSS-sensitive compatibility mode
  - `local`: deprecated and not recommended
- Add a 2.0.1 changelog entry that clearly states the remaining architectural
  limitation.

#### Exit criteria

- A repository search finds no production-readiness or browser-token-protection claim
  for the token-mediating examples.
- Automated tests prove that secrets, codes, tokens, and profile fields are absent
  from logs on success and failure paths.
- The example server exits with a non-zero status when required configuration is
  missing.
- All quick starts use `storage: none` and do not render Emirates ID.

### Phase 1: Correct the Angular Compatibility Flow

**Release target:** 2.1.0

**Priority:** High

**Estimated effort:** Medium

**Dependency:** Phase 0

This phase reduces risk for existing 2.x consumers while the BFF API is being built.
It must not be described as equivalent to the BFF architecture.

#### Work

- Extend `UaePassAuthStatus` with explicit identity states:
  - `Authorizing`
  - `ExchangingToken`
  - `FetchingIdentity`
  - `IdentityVerified`
  - `Error`
  - `LoggedOut`
- Set `isAuthenticated` only when a required, runtime-validated identity is present.
- If user-info retrieval or validation fails:
  - clear in-memory tokens and profile;
  - clear persisted data;
  - move to `Error`;
  - return a typed identity-verification error.
- On restoration, require both a valid, unexpired token record and a valid profile.
  Never restore an authenticated state from an access-token string alone.
- Add runtime validation for:
  - non-empty access token;
  - expected token type;
  - positive finite `expires_in`;
  - required scopes, when configured;
  - required identity fields, including a stable subject identifier.
- Fail closed when token expiry is missing, invalid, or non-positive.
- Never persist refresh tokens or ID tokens in browser storage.
- Mark `UaePassStorageMode.Local` as deprecated in types and documentation.
- Add a warning in the session-storage documentation that JavaScript on the same
  origin can read stored data.
- Remove the unused `uae-pass.service.ts`, which is not part of the exported public
  API, and rename its misleading spec file to match `UaePassAuthService`.
- Update the callback and login components for the new intermediate states.

#### Exit criteria

- A failed or malformed user-info response can never produce
  `isAuthenticated() === true`.
- Missing or invalid expiry data is rejected by unit tests.
- Restored state requires a valid token/profile pair.
- Persisted JSON never contains `refresh_token` or `id_token`.
- Existing supported Angular versions pass the library test suite.

### Phase 2: Deliver the Server-Owned BFF

**Release target:** 3.0.0 release candidate

**Priority:** Blocker for production recommendation

**Estimated effort:** Large

**Dependencies:** Phase 0 and a confirmed UAE PASS environment contract

#### Backend API

| Endpoint | Responsibility |
| --- | --- |
| `GET /auth/uae-pass/login` | Validate a local return path, create state and optional onboarding-approved PKCE, store a one-time server transaction, and redirect to UAE PASS |
| `GET /auth/uae-pass/callback` | Validate and consume state, exchange the code, fetch and validate user info, rotate the application session, and redirect to Angular |
| `GET /api/session` | Return authentication status and a minimized application profile; never return UAE PASS tokens |
| `POST /auth/logout` | Enforce CSRF protection, invalidate the server session and tokens, expire the cookie, and initiate UAE PASS logout |
| `GET /health/live` | Report process liveness without checking external dependencies |
| `GET /health/ready` | Report whether required configuration and session dependencies are ready |

#### Server controls

- Store state, creation time, return path, initiating session ID, and any enabled
  PKCE verifier server-side.
- Make transactions short-lived, one-time-use, and safe under concurrent login
  attempts.
- Bind the callback to the initiating browser session and rotate the session ID after
  login to prevent fixation.
- Keep access, refresh, and ID tokens in the server-side session store.
- Use an opaque cookie with `HttpOnly`, `Secure`, `Path=/`, an intentional
  `SameSite` value, and a bounded lifetime.
- Provide a session-store interface plus a production-capable shared-store example.
  An in-memory store must be clearly labeled local-development only.
- Allow only configured redirect URIs and local return paths.
- Add strict request schemas, maximum field lengths, endpoint-specific rate limits,
  security headers, trusted-proxy configuration, origin checks, and CSRF protection.
- Add outbound connect/response timeouts, abort handling, response-size limits,
  content-type validation, and safe handling of non-JSON provider errors.
- Use structured logging containing only correlation ID, internal error code, status
  category, duration, and environment.
- Add graceful shutdown, secret-rotation guidance, and separate liveness/readiness
  checks.
- Return only a minimized application profile from `/api/session`.

#### Angular 3.x API

- Replace `tokenProxyUrl` and `userInfoProxyUrl` with BFF-owned URLs such as:
  - `loginUrl`
  - `sessionUrl`
  - `logoutUrl`
- Replace browser callback processing with:
  - `login(returnPath?)`;
  - `restoreSession()` or `getSession()`;
  - `logout()`.
- Remove public token signals and token exchange/user-info methods from the primary
  entry point.
- Model authentication around a validated application session and minimized profile.
- Update the demo so it never accesses a UAE PASS bearer token.
- Publish a 2.x-to-3.x migration guide with before/after configuration and endpoint
  contracts.

#### Exit criteria

- Browser network responses, browser storage, Angular signals, and application logs
  contain no UAE PASS access, refresh, or ID tokens.
- The backend rejects missing, expired, mismatched, and replayed transactions.
- The backend ignores browser attempts to select the redirect URI, PKCE verifier, or
  bearer token.
- Login rotates the application session and logout invalidates it.
- Cookie and CSRF behavior is verified for the documented same-origin and
  cross-origin deployment models.
- The production-capable session-store example passes a two-instance integration
  test.

### Phase 3: Build the Security Test Harness and CI Matrix

**Release target:** Required before 3.0.0 stable

**Priority:** High

**Estimated effort:** Medium to large

**Dependency:** Phase 2 endpoint contracts

#### Work

- Create a local OAuth/OIDC test provider supporting:
  - authorization success and provider errors;
  - short-lived and one-time authorization codes;
  - optional PKCE verification;
  - the confirmed HTTP Basic client-authentication method;
  - token and user-info success, malformed responses, and failures;
  - delayed responses and connection aborts;
  - concurrent transactions and replay attempts.
- Add backend unit and integration tests for validation, cookies, CSRF, origin
  checks, session rotation, logout, rate limits, logging, timeouts, and error mapping.
- Add browser-level tests proving that tokens never appear in local storage, session
  storage, application-visible responses, or rendered state.
- Add Angular compatibility jobs for:
  - Angular 19.2 minimum;
  - latest Angular 19;
  - Angular 20 minimum;
  - latest Angular 20.
- Run backend lint, tests, production dependency audit, and container checks in the
  root CI workflow.
- Make security regression tests mandatory branch-protection checks.

#### Exit criteria

- All threat cases listed in the July 29 review have an automated regression test.
- The complete matrix passes on pull requests and release tags.
- Coverage thresholds include the backend authentication and session modules, not
  only the Angular library.

### Phase 4: Supply Chain, Governance, and Independent Assurance

**Release target:** 3.x hardening track

**Priority:** Medium

**Estimated effort:** Medium and ongoing

**Dependency:** Stable BFF implementation

#### Work

- Add CodeQL and secret scanning.
- Generate an SBOM for each release artifact.
- Pin third-party GitHub Actions to reviewed commit SHAs.
- Sign release tags and document artifact-verification steps.
- Publish:
  - a threat model;
  - an architecture decision record for the BFF boundary;
  - PII minimization, masking, retention, and access-control guidance;
  - token lifecycle and logout behavior;
  - the support and release cadence.
- Add at least one trusted maintainer and require review for security-sensitive paths.
- Obtain an independent OAuth/application-security assessment before restoring any
  production-readiness claim.

#### Exit criteria

- Release artifacts include provenance, an SBOM, and verification instructions.
- Security-sensitive changes require an independent reviewer.
- The published threat model and external assessment cover the shipped 3.x design.

## Workstream Ownership

| Workstream | Suggested owner | Review required from |
| --- | --- | --- |
| Documentation containment | Maintainer | Security reviewer |
| Angular state and validation | Angular maintainer | Security reviewer |
| BFF authentication/session flow | Backend maintainer | OAuth and application-security reviewer |
| Provider contract verification | UAE PASS integration owner | UAE PASS onboarding contact |
| Test provider and end-to-end tests | Test engineer | Angular and backend maintainers |
| CI and release hardening | Repository maintainer | Security reviewer |
| Privacy and data minimization | Product/data owner | Privacy or compliance reviewer |

## Pull Request Breakdown

Keep changes reviewable and independently releasable:

1. Correct security claims and storage guidance.
2. Remove sensitive logging and fallback backend credentials.
3. Add Angular identity states and failure semantics.
4. Add strict token/profile validators and persistence hardening.
5. Introduce the BFF transaction and session modules.
6. Add BFF login and callback endpoints.
7. Add session, logout, CSRF, cookie, and operational controls.
8. Replace the Angular API and demo with the session-based flow.
9. Add the mock provider and security regression suite.
10. Add the Angular version matrix and backend CI gates.
11. Publish migration, threat-model, and operational documentation.
12. Complete an independent security review and release 3.0.0.

## Final Release Gate

Do not describe the project as production-ready until all of the following are true:

- Phase 0 through Phase 3 exit criteria pass.
- The published token endpoint contract is implemented, and client-specific UAE PASS
  onboarding values are confirmed for the target environment.
- No UAE PASS token crosses the BFF-to-browser boundary.
- A security reviewer signs off on the threat model and implementation.
- A staging exercise validates login, concurrent transactions, cancellation, replay
  rejection, logout, session expiry, and failure recovery.
