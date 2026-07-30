import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout as rxTimeout } from 'rxjs/operators';

import { UAE_PASS_CONFIG } from './uae-pass.config';
import { UaePassAuthStatus } from './uae-pass.enums';
import { UaePassError, UaePassErrorCode, toUaePassError } from './uae-pass.error';
import type { UaePassSessionResponse, UaePassUserProfile } from './uae-pass.types';

function isProfile(value: unknown): value is UaePassUserProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const sub = (value as { sub?: unknown }).sub;
  return typeof sub === 'string' && sub.trim().length > 0;
}

function isSessionResponse(value: unknown): value is UaePassSessionResponse {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const response = value as Partial<UaePassSessionResponse>;
  if (typeof response.authenticated !== 'boolean') return false;
  if (!response.authenticated) return response.profile === null || response.profile === undefined;
  return (
    isProfile(response.profile) &&
    typeof response.csrfToken === 'string' &&
    response.csrfToken.trim().length > 0
  );
}

export function localReturnPath(candidate: string): string {
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return '/';
  }
  return candidate;
}

export function buildLoginUrl(
  loginUrl: string,
  origin: string,
  currentPath: string,
  returnPath: string | undefined,
  language: 'en' | 'ar'
): string {
  const login = new URL(loginUrl, origin);
  login.searchParams.set('returnTo', localReturnPath(returnPath ?? currentPath));
  login.searchParams.set('ui_locales', language);
  return login.toString();
}

@Injectable({ providedIn: 'root' })
export class UaePassAuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(UAE_PASS_CONFIG);

  private readonly _status = signal<UaePassAuthStatus>(UaePassAuthStatus.Idle);
  private readonly _profile = signal<UaePassUserProfile | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _errorCode = signal<UaePassErrorCode | null>(null);
  private csrfToken: string | null = null;

  readonly status = this._status.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly error = this._error.asReadonly();
  readonly errorCode = this._errorCode.asReadonly();
  readonly isAuthenticated = computed(
    () => this._status() === UaePassAuthStatus.Authenticated && isProfile(this._profile())
  );

  constructor() {
    if (this.config.autoRestoreSession !== false) {
      void this.restoreSession();
    }
  }

  async restoreSession(): Promise<boolean> {
    this._status.set(UaePassAuthStatus.LoadingSession);
    this.resetError();

    try {
      const response: unknown = await firstValueFrom(
        this.http
          .get(this.config.sessionUrl, {
            withCredentials: true,
          })
          .pipe(rxTimeout(this.requestTimeoutMs()))
      );

      if (!isSessionResponse(response)) {
        throw new UaePassError(
          UaePassErrorCode.InvalidSessionResponse,
          'The BFF returned an invalid session response'
        );
      }

      if (!response.authenticated || !response.profile) {
        this.clearSessionState(UaePassAuthStatus.Idle);
        return false;
      }

      this.csrfToken = response.csrfToken ?? null;
      this._profile.set(response.profile);
      this._status.set(UaePassAuthStatus.Authenticated);
      return true;
    } catch (error) {
      this.clearSessionState(UaePassAuthStatus.Error);
      this.setError(
        toUaePassError(
          error,
          UaePassErrorCode.SessionFetchFailed,
          'Unable to restore the application session'
        )
      );
      return false;
    }
  }

  login(returnPath?: string): void {
    this.resetError();
    this._status.set(UaePassAuthStatus.Authorizing);

    if (typeof window === 'undefined' || !window.location) {
      this.setError(
        new UaePassError(
          UaePassErrorCode.RedirectUnavailable,
          'Window is not available to start authentication'
        )
      );
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(
      buildLoginUrl(
        this.config.loginUrl,
        window.location.origin,
        currentPath,
        returnPath,
        this.config.language === 'ar' ? 'ar' : 'en'
      )
    );
  }

  async logout(): Promise<void> {
    this._status.set(UaePassAuthStatus.LoggingOut);
    this.resetError();

    try {
      const headers = this.csrfToken
        ? new HttpHeaders({ 'X-CSRF-Token': this.csrfToken })
        : undefined;
      const response = await firstValueFrom(
        this.http
          .post<{ loggedOut?: boolean; redirectUrl?: string }>(
            this.config.logoutUrl,
            {},
            {
              headers,
              withCredentials: true,
            }
          )
          .pipe(rxTimeout(this.requestTimeoutMs()))
      );

      this.clearSessionState(UaePassAuthStatus.LoggedOut);
      if (response?.redirectUrl && typeof window !== 'undefined') {
        const safeUrl = this.sanitizeRedirectUrl(response.redirectUrl);
        if (safeUrl) {
          window.location.assign(safeUrl);
        }
      }
    } catch (error) {
      this.clearSessionState(UaePassAuthStatus.Error);
      this.setError(
        toUaePassError(
          error,
          UaePassErrorCode.LogoutFailed,
          'Unable to end the application session'
        )
      );
    }
  }

  resetError(): void {
    this._error.set(null);
    this._errorCode.set(null);
  }

  private requestTimeoutMs(): number {
    return this.config.requestTimeoutMs ?? 20_000;
  }

  private sanitizeRedirectUrl(url: string): string | null {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private clearSessionState(status: UaePassAuthStatus): void {
    this.csrfToken = null;
    this._profile.set(null);
    this._status.set(status);
  }

  private setError(error: UaePassError): void {
    this._status.set(UaePassAuthStatus.Error);
    this._error.set(error.message);
    this._errorCode.set(error.code);
  }
}
