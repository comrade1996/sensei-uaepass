# Storage Modes

Configure persistence with `UaePassConfig.storage` (enum or string):

- `none` — No persistence. Tokens/profile live in memory only.
- `session` — Stored in `sessionStorage`. Cleared on tab close.
- `local` — Stored in `localStorage`. Persists across sessions.

Example:

```ts
import { UaePassStorageMode } from 'sensei-uaepass';

provideUaePass({
  // ...
  storage: UaePassStorageMode.Session,
});
```
