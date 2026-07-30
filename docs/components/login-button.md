# Login Button

`UaePassLoginButtonComponent` is a standalone, localized UAE PASS button.

```ts
@Component({
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  template: `<uae-pass-login-button language="en" />`,
})
export class LoginComponent {}
```

Inputs:

- `language`
- `customImageSrc`
- `customStyles`
- `isDisabled`

Output:

- `pressed`

Clicking the button calls `UaePassAuthService.login()`. It is disabled while session
restoration, authorization redirect, or logout is in progress.
