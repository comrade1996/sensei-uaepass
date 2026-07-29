import type { Signal } from '@angular/core';

import type { UaePassAuthStatus } from './uae-pass.enums';

/**
 * Minimized application identity returned by the BFF.
 * Applications should extend this shape only with fields they genuinely need.
 */
export interface UaePassUserProfile {
  sub: string;
  fullnameEN?: string;
  fullnameAR?: string;
  email?: string;
  userType?: string;
  [key: string]: unknown;
}

export interface UaePassSessionResponse {
  authenticated: boolean;
  profile?: UaePassUserProfile | null;
  csrfToken?: string;
}

export interface UaePassAuthState {
  status: Signal<UaePassAuthStatus>;
  profile: Signal<UaePassUserProfile | null>;
  error: Signal<string | null>;
}
