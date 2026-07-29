# OAuth 2.0 and PKCE

Version 3 moves the complete OAuth transaction to the BFF.

1. The BFF always generates cryptographically random state.
2. It stores the transaction in the server-side session.
3. When `UAE_PASS_PKCE_ENABLED=true`, it also stores a verifier and sends only its
   S256 challenge to UAE PASS.
4. The registered callback returns to the BFF.
5. The BFF validates and consumes the transaction before exchanging the code.
6. The browser never receives a verifier, authorization code, or token response.

Transactions are short-lived, one-time-use, bound to the initiating session, and safe
under concurrent login attempts.

The published UAE PASS web contract does not document PKCE parameters. PKCE is
disabled by default and must be enabled only after the UAE PASS onboarding team
confirms S256 support for the registered client.
