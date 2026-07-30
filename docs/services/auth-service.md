# Authentication Service

`UaePassAuthService` is provided in the root injector.

## Signals

- `status` — `Idle`, `LoadingSession`, `Authorizing`, `Authenticated`,
  `LoggingOut`, `Error`, or `LoggedOut`
- `profile` — minimized, runtime-validated BFF profile
- `isAuthenticated` — true only when status and identity are valid
- `error` and `errorCode` — safe client-side error details

There is deliberately no public token signal.

## Methods

### `login(returnPath?: string): void`

Redirects to the BFF login endpoint. Only a local return path is sent.

### `restoreSession(): Promise<boolean>`

Calls the BFF session endpoint with credentials. An authenticated response requires a
non-empty stable `sub` and a CSRF token.

### `logout(): Promise<void>`

Posts to the BFF logout endpoint using the in-memory CSRF token. The BFF invalidates
the application session and returns the official UAE PASS logout URL. The browser
navigates to that URL so both sessions are ended.

### `resetError(): void`

Clears current client-side error state.
