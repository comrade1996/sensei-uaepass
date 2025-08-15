// UAE PASS constants and endpoint helpers
// Mirrors Flutter implementation in lib/uaepass/constant.dart
import { UaePassAcr } from './uae-pass.enums';

export const UAE_PASS_BASE_URL = {
  prod: 'https://id.uaepass.ae',
  stg: 'https://stg-id.uaepass.ae',
} as const;

// Backward-compatible constant mapping to enums
export const UAE_PASS_ACR = {
  mobileOnDevice: UaePassAcr.MobileOnDevice,
  web: UaePassAcr.Web,
} as const;

export function baseUrl(isProduction: boolean): string {
  return isProduction ? UAE_PASS_BASE_URL.prod : UAE_PASS_BASE_URL.stg;
}

export function authorizeUrl(isProduction: boolean): string {
  return `${baseUrl(isProduction)}/idshub/authorize`;
}

export function tokenUrl(isProduction: boolean): string {
  return `${baseUrl(isProduction)}/idshub/token`;
}

export function userInfoUrl(isProduction: boolean): string {
  return `${baseUrl(isProduction)}/idshub/userinfo`;
}

export function logoutUrl(isProduction: boolean, redirectUri: string): string {
  return `${baseUrl(isProduction)}/idshub/logout?redirect_uri=${encodeURIComponent(redirectUri)}`;
}
