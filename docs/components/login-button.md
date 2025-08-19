# Login Button

Component: `UaePassLoginButtonComponent`

- Selector: `<uae-pass-login-button>`
- Action: Calls `redirectToAuthorization()` on click
- Busy state: Disabled during authorize/token exchange

## Inputs

- `language?: 'en' | 'ar'` — Optional; defaults to config language
- `customImageSrc?: string | null` — Override image src
- `customStyles?: string` — Inline CSS for the image element
- `isDisabled?: boolean` — Force disabled

## Outputs

- `pressed: void` — Emitted on click

## Usage

```html
<!-- default (uses config language and logos) -->
<uae-pass-login-button></uae-pass-login-button>

<!-- force English -->
<uae-pass-login-button [language]="'en'"></uae-pass-login-button>

<!-- custom image and style -->
<uae-pass-login-button
  [customImageSrc]="'/assets/custom-uaepass.svg'"
  [customStyles]="'max-width:320px'"
></uae-pass-login-button>
```
