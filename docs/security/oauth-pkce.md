# UAE PASS OAuth 2.0 and PKCE Security

Sensei UAE PASS uses Authorization Code with PKCE S256 for browser authentication.

## Authorization transaction

1. The library obtains random state and verifier bytes from Web Crypto.
2. It derives the S256 challenge and stores the verifier in session storage under the state value.
3. UAE PASS redirects to the registered callback with a code and state.
4. The library verifies the callback origin and path, loads the exact state transaction, and rejects missing or expired transactions.
5. The authorization code and verifier are sent to the configured backend token endpoint.
6. The transaction is deleted after success or failure to prevent replay.

There is no `Math.random` fallback. Authentication fails closed when Web Crypto is unavailable.

## Application responsibilities

- Use HTTPS in production.
- Register exact redirect and logout URLs with UAE PASS.
- Apply rate limits, origin checks, request validation, and secure headers to backend endpoints.
- Never log authorization codes, verifiers, access tokens, refresh tokens, profiles, or client secrets.
- Validate provider responses and apply least-privilege scopes.
