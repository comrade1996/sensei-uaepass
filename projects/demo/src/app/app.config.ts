import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideUaePass, UaePassLanguageCode } from 'sensei-uaepass';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideUaePass({
      loginUrl: 'http://localhost:3001/auth/uae-pass/login',
      sessionUrl: 'http://localhost:3001/api/session',
      logoutUrl: 'http://localhost:3001/auth/logout',
      language: UaePassLanguageCode.En,
      buttonLogos: {
        english: 'assets/UAEPASS_Sign_with_Btn_Outline_Active@2x.svg',
        arabic: 'assets/UAEPASS_Sign_with_Btn_Outline_Active_AR@2x.svg',
      },
    }),
  ],
};
