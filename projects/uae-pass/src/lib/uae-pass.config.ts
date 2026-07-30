import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

import type { UaePassLanguageCode } from './uae-pass.enums';

export type UaePassLanguage = UaePassLanguageCode | 'en' | 'ar';

export interface UaePassConfig {
  /** BFF endpoint that starts login and redirects to UAE PASS. */
  loginUrl: string;
  /** BFF endpoint that returns the current application session. */
  sessionUrl: string;
  /** BFF endpoint that invalidates the current application session. */
  logoutUrl: string;
  language?: UaePassLanguage;
  requestTimeoutMs?: number;
  autoRestoreSession?: boolean;
  buttonLogos?: {
    english?: string;
    arabic?: string;
  };
}

export const UAE_PASS_CONFIG = new InjectionToken<Readonly<UaePassConfig>>('UAE_PASS_CONFIG');

function requireEndpoint(value: string | undefined, name: string): void {
  if (!value?.trim()) throw new Error(`UAE PASS ${name} is required`);
  if (/^javascript:/i.test(value.trim())) {
    throw new Error(`UAE PASS ${name} must use an HTTP(S) or relative URL`);
  }
}

export function validateUaePassConfig(config: UaePassConfig): Readonly<UaePassConfig> {
  requireEndpoint(config.loginUrl, 'loginUrl');
  requireEndpoint(config.sessionUrl, 'sessionUrl');
  requireEndpoint(config.logoutUrl, 'logoutUrl');
  if (config.language && config.language !== 'en' && config.language !== 'ar') {
    throw new Error('UAE PASS language must be "en" or "ar"');
  }
  if (
    config.requestTimeoutMs !== undefined &&
    (!Number.isFinite(config.requestTimeoutMs) || config.requestTimeoutMs <= 0)
  ) {
    throw new Error('UAE PASS requestTimeoutMs must be a positive finite number');
  }
  return Object.freeze({ ...config });
}

export function provideUaePass(config: UaePassConfig): Provider[] {
  return [{ provide: UAE_PASS_CONFIG, useValue: validateUaePassConfig(config) }];
}
