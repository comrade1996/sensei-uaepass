# Callback Component

Component: `UaePassCallbackComponent`

- Selector: `<uae-pass-callback>`
- Role: Handles the OAuth redirect, exchanges the code for tokens, fetches profile, and renders loading/success/error states.

## Inputs

- `url?: string | null` — Optional current URL override (useful for SSR or testing). If omitted, uses `window.location.href`.

## Outputs

- `success: void` — Emitted when authentication completes successfully
- `failed: string` — Emitted when an error occurs (message provided)

## Behavior

- Automatically calls `handleRedirectCallback()` if the current URL contains `code` or `error`.
- On success, emits `success` and auto-redirects to `/` after 2 seconds.
- On error, emits `failed` with the error message.
- Localizes text and RTL layout based on `UaePassConfig.language`.

## Usage

Route mapping:

```ts
import { Routes } from '@angular/router';
import { UaePassCallbackComponent } from 'sensei-uaepass';

export const routes: Routes = [
  { path: 'uae-pass/callback', component: UaePassCallbackComponent },
];
```

Optional event handling:

```html
<uae-pass-callback (success)="onOk()" (failed)="onErr($event)"></uae-pass-callback>
```
