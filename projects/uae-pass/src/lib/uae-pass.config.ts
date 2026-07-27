import type { Provider } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { UaePassLanguageCode, UaePassStorageMode } from './uae-pass.enums';

export type UaePassLanguage = UaePassLanguageCode | 'en' | 'ar';

export interface UaePassConfig {
  clientId: string;
  redirectUri: string;
  isProduction: boolean;
  language?: UaePassLanguage;
  // Optional scope override. Default: 'urn:uae:digitalid:profile:general'
  scope?: string;
  // Required backend endpoints keep confidential operations and secrets out of the browser
  tokenProxyUrl: string;
  userInfoProxyUrl: string;
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

export function validateUaePassConfig(config: UaePassConfig): Readonly<UaePassConfig> {
  if (!config.clientId?.trim()) throw new Error('UAE PASS clientId is required');
  if (!config.redirectUri?.trim()) throw new Error('UAE PASS redirectUri is required');
  if (!config.tokenProxyUrl?.trim()) throw new Error('UAE PASS tokenProxyUrl is required');
  if (!config.userInfoProxyUrl?.trim()) throw new Error('UAE PASS userInfoProxyUrl is required');
  if (config.language && config.language !== 'en' && config.language !== 'ar') {
    throw new Error('UAE PASS language must be "en" or "ar"');
  }
  if (config.requestTimeoutMs !== undefined && config.requestTimeoutMs <= 0) {
    throw new Error('UAE PASS requestTimeoutMs must be greater than zero');
  }
  return Object.freeze({ ...config });
}

export function provideUaePass(config: UaePassConfig): Provider[] {
  return [{ provide: UAE_PASS_CONFIG, useValue: validateUaePassConfig(config) }];
}
