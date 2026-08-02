# Authentication and Session Errors

Angular reports typed errors through the `UaePassAuthService` signals.

## Client-side error codes

| Code | Signal | Description |
| --- | --- | --- |
| `redirect_unavailable` | `errorCode()` | Browser navigation (`window.location`) is unavailable |
| `session_fetch_failed` | `errorCode()` | The BFF session request failed or timed out |
| `invalid_session_response` | `errorCode()` | The response is malformed or lacks a stable identity |
| `logout_failed` | `errorCode()` | Logout failed, timed out, or was rejected |
| `invalid_configuration` | thrown | Config validation failed at startup |
| `authorization_failed` | `errorCode()` | Login redirect failed |

## Error handling in components

```ts
import { Component, inject } from '@angular/core';
import { UaePassAuthService, UaePassErrorCode } from 'sensei-uaepass';

@Component({
  standalone: true,
  template: `
    @if (auth.error(); as err) {
      <div class="alert" role="alert">
        <strong>{{ auth.errorCode() }}</strong>: {{ err }}
        <button (click)="auth.resetError()">Dismiss</button>
      </div>
    }
  `,
})
export class ErrorComponent {
  readonly auth = inject(UaePassAuthService);
}
```

## Error flow

```mermaid
flowchart TD
    A[Operation starts] --> B{Success?}
    B -->|Yes| C[Update status + profile signals]
    B -->|No| D[Set status = Error]
    D --> E[Set error message]
    D --> F[Set errorCode]
    E --> G[Component displays error]
    F --> G
    G --> H[User clicks dismiss]
    H --> I[resetError()]
    I --> J[Clear error + errorCode]
```

## Using error codes for conditional behavior

```ts
const auth = inject(UaePassAuthService);

// Check specific error codes
if (auth.errorCode() === UaePassErrorCode.SessionFetchFailed) {
  // Show retry button for network errors
} else if (auth.errorCode() === UaePassErrorCode.InvalidSessionResponse) {
  // Show "session corrupted" message, suggest re-login
}
```

## BFF correlation IDs

The BFF returns a generated `correlationId` in error responses. Use it to find safe
structured operational logs:

```json
{
  "error": "invalid_transaction",
  "correlationId": "a1b2c3d4-e5f6-..."
}
```

> Do not add codes, tokens, cookies, or identity payloads to logs while troubleshooting.
