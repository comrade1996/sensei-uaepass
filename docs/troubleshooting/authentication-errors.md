# Authentication and Session Errors

Angular reports these typed errors:

- `redirect_unavailable` — browser navigation is unavailable.
- `session_fetch_failed` — the BFF session request failed or timed out.
- `invalid_session_response` — the response is malformed or lacks a stable identity.
- `logout_failed` — logout failed, timed out, or was rejected.

The BFF returns a generated `correlationId`. Use it to find safe structured
operational logs. Do not add codes, tokens, cookies, or identity payloads to logs
while troubleshooting.
