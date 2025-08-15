import { InjectionToken, Provider } from '@angular/core';
import { UaePassLanguageCode, UaePassStorageMode } from './uae-pass.enums';

export type UaePassLanguage = UaePassLanguageCode | (string & {});

export interface UaePassConfig {
  clientId: string;
  redirectUri: string;
  isProduction: boolean;
  language?: UaePassLanguage;
  // Strongly recommended to keep secrets on a backend; SPA should prefer a proxy
  clientSecret?: string;
  // Optional scope override. Default: 'urn:uae:digitalid:profile:general'
  scope?: string;
  // If CORS blocks direct calls to UAE PASS, set a backend proxy endpoint here
  tokenProxyUrl?: string;
  userInfoProxyUrl?: string;
  // Request timeout in ms
  requestTimeoutMs?: number;
  // Persistence strategy for tokens/profile. Default: 'none'
  // Accepts enum for ergonomics, or legacy string values for compatibility
  storage?: UaePassStorageMode | 'none' | 'session' | 'local';
  // Display only; used to show SOP1 restriction message in apps that need it
  blockSOP1?: boolean;
  serviceProviderEnglishName?: string;
  serviceProviderArabicName?: string;
  // Optional separate logout redirect URI. If not provided, uses redirectUri
  logoutRedirectUri?: string;
  // Language-specific button logos
  buttonLogos?: {
    english?: string;
    arabic?: string;
  };
}

export const UAE_PASS_CONFIG = new InjectionToken<UaePassConfig>('UAE_PASS_CONFIG');

export function provideUaePass(config: UaePassConfig): Provider[] {
  return [{ provide: UAE_PASS_CONFIG, useValue: config }];
}
