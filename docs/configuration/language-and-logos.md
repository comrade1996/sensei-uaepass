# Language & Logos

## Language resolution

`UaePassLoginButtonComponent` resolves language as:

1. Input `language` (`'en' | 'ar'`) if provided
2. Else `UaePassConfig.language` (enum or string; `'ar'` normalized)
3. Else defaults to `'en'`

The service also includes `ui_locales` in the authorize URL based on `UaePassConfig.language`.

## Logos

You can override the default button images:

```ts
provideUaePass({
  // ...
  buttonLogos: {
    english: '/assets/UAEPASS_Sign_with_Btn_Outline_Active@2x.svg',
    arabic: '/assets/UAEPASS_Sign_with_Btn_Outline_Active_AR@2x.svg'
  }
});
```

If `buttonLogos` is not provided, defaults are used from the library’s assets mapping. If you pass a custom `language` or set it in config to Arabic, the Arabic logo is picked automatically.
