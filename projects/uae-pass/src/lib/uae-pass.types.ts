import { Signal } from '@angular/core';
import { UaePassAuthStatus } from './uae-pass.enums';

export interface UaePassUserProfile {
  sub?: string;
  fullnameAR?: string;
  gender?: string;
  mobile?: string;
  lastnameEN?: string;
  fullnameEN?: string;
  uuid?: string;
  lastnameAR?: string;
  idn?: string;
  nationalityEN?: string;
  firstnameEN?: string;
  userType?: string;
  nationalityAR?: string;
  firstnameAR?: string;
  email?: string;
}

export interface UaePassTokens {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
  [k: string]: unknown;
}

// Re-export enum for convenience so consumers can import from either types or enums module
export { UaePassAuthStatus };

export interface UaePassAuthState {
  status: Signal<UaePassAuthStatus>;
  tokens: Signal<UaePassTokens | null>;
  profile: Signal<UaePassUserProfile | null>;
  error: Signal<string | null>;
}
