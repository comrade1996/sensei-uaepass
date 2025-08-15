import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideUaePass,
  UaePassLanguageCode,
  UaePassStorageMode,
} from 'sensei-uaepass';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideUaePass({
      clientId: 'sandbox_stage',
      clientSecret: 'sandbox_stage',
      redirectUri: 'http://localhost:4200/uae-pass/callback',
      logoutRedirectUri: 'http://localhost:4200/',
      isProduction: false,
      language: UaePassLanguageCode.Ar,
      storage: UaePassStorageMode.Session,
      scope: 'urn:uae:digitalid:profile:general',
      // Enable proxy URLs for CORS-safe token exchange and userinfo
      tokenProxyUrl: 'http://localhost:3001/api/uae-pass/token',
      userInfoProxyUrl: 'http://localhost:3001/api/uae-pass/userinfo',
      // Language-specific button logos
      buttonLogos: {
        english: 'assets/UAEPASS_Sign_with_Btn_Outline_Active@2x.svg',
        arabic: 'assets/UAEPASS_Sign_with_Btn_Outline_Active_AR@2x.svg',
      },
    }),
  ],
};
