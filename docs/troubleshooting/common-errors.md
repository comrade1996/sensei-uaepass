# Common Errors

- **Security check failed (state mismatch)**
  - Cause: `state` in callback doesn’t match stored value.
  - Fix: Don’t reuse old tabs; ensure the whole flow happens in one tab. Clear site data and retry.

- **CORS / Network errors on token or userinfo**
  - Cause: Direct browser calls blocked.
  - Fix: Use a backend proxy and set `tokenProxyUrl` and `userInfoProxyUrl` in `provideUaePass(...)`.

- **Invalid redirect_uri / 400 from token endpoint**
  - Cause: Redirect URI mismatch with tenant config.
  - Fix: Ensure exact match (scheme, host, path). Update tenant or code.

- **No profile after successful token exchange**
  - Cause: `userinfo` call failed or profile is empty.
  - Fix: Check proxy logs and access token; handle gracefully. Authentication is still valid.

- **Callback route not reached**
  - Cause: Missing route mapping.
  - Fix: Add `{ path: 'uae-pass/callback', component: UaePassCallbackComponent }`.

- **Stuck on loading**
  - Cause: Redirect not triggered or callback not handled.
  - Fix: Check console logs and network. Ensure `redirectToAuthorization()` is called on click and `UaePassCallbackComponent` is rendered on the callback route.
