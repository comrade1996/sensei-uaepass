# ADR 001: BFF Security Boundary

**Status:** Accepted

**Date:** July 29, 2026

## Context

Version 2 used a token-mediating backend. Angular supplied the code, redirect URI,
and PKCE verifier, then received and stored the token response and profile. This left
provider tokens exposed to browser JavaScript and did not bind the OAuth transaction
to a server session.

## Decision

Version 3 makes the application BFF the OAuth boundary. The BFF owns login
initiation, state, PKCE, callback handling, token exchange, user-info retrieval,
identity validation, session rotation, token storage, and logout.

Angular receives only an opaque application cookie and a minimized session response.

## Consequences

- The public Angular API is smaller and no longer exposes tokens.
- Version 3 is a breaking release.
- Applications must operate a stateful BFF and production shared session store.
- XSS cannot directly read provider tokens, though it can still act through the
  current application session.
- Provider contract verification and server security review become explicit release
  gates.
