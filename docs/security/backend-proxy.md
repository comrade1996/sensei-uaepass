# Backend Proxy Security Boundary

The Angular library requires `tokenProxyUrl` and `userInfoProxyUrl`. Confidential UAE PASS credentials belong only on the server.

## Token endpoint contract

The Angular client sends:

```json
{
  "code": "authorization-code",
  "redirect_uri": "https://app.example.com/uae-pass/callback",
  "code_verifier": "pkce-verifier"
}
```

The backend adds the configured client ID and secret, sends a form-encoded request to UAE PASS, validates the response, and returns only the fields needed by the application.

## User information endpoint contract

The Angular client sends the access token to its own backend over HTTPS. The backend calls UAE PASS and returns the validated profile.

## Required backend controls

- Keep secrets in a managed secret store or environment variables.
- Restrict allowed origins and redirect URIs.
- Validate request shapes and response content types.
- Apply rate limits, timeouts, and maximum response sizes.
- Redact credentials, codes, tokens, and identity fields from logs.
- Return generic client errors while retaining correlation IDs for server diagnostics.
