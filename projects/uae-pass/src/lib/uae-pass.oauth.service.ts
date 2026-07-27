import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout as rxTimeout } from 'rxjs/operators';

import { UAE_PASS_CONFIG } from './uae-pass.config';
import { authorizeUrl, logoutUrl } from './uae-pass.constants';
import type { UaePassTokens, UaePassUserProfile } from './uae-pass.types';
import {
  UaePassAuthStatus,
  UaePassAcr,
  UaePassLanguageCode,
  OAuthResponseType,
  CodeChallengeMethod,
} from './uae-pass.enums';
import { UaePassMemory } from './uae-pass.memory';
import { generateState, generatePkcePair } from './uae-pass.pkce';
import { clearAll, loadProfile, loadTokens, saveProfile, saveTokens } from './uae-pass.storage';
import { getUaePassTexts } from './uae-pass.i18n';
import { UaePassError, UaePassErrorCode, toUaePassError } from './uae-pass.error';

@Injectable({ providedIn: 'root' })
export class UaePassAuthService {
  private readonly http = inject(HttpClient);
  private readonly cfg = inject(UAE_PASS_CONFIG);

  // Signals-based state
  private readonly _status = signal<UaePassAuthStatus>(UaePassAuthStatus.Idle);
  private readonly _tokens = signal<UaePassTokens | null>(null);
  private readonly _profile = signal<UaePassUserProfile | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _errorCode = signal<UaePassErrorCode | null>(null);

  readonly status = this._status.asReadonly();
  readonly tokens = this._tokens.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly error = this._error.asReadonly();
  readonly errorCode = this._errorCode.asReadonly();

  readonly isAuthenticated = computed(
    () => this._status() === UaePassAuthStatus.Authenticated && !!this._tokens()
  );

  // Localized texts
  private readonly texts = computed(() => {
    const lang = this.cfg.language || 'en';
    return getUaePassTexts(lang as 'en' | 'ar');
  });

  // Defaults
  private requestTimeoutMs(): number {
    return this.cfg.requestTimeoutMs ?? 20_000;
  }

  private storageMode() {
    return this.cfg.storage ?? 'none';
  }

  constructor() {
    const tokens = loadTokens(this.storageMode(), this.cfg.clientId);
    if (tokens) {
      this._tokens.set(tokens);
      const profile = loadProfile(this.storageMode(), this.cfg.clientId);
      if (profile) this._profile.set(profile);
      this._status.set(UaePassAuthStatus.Authenticated);
    }
  }

  private setError(error: UaePassError): void {
    this._status.set(UaePassAuthStatus.Error);
    this._error.set(error.message);
    this._errorCode.set(error.code);
  }

  // 1) Build UAE PASS authorize URL with PKCE + state; store ephemeral values in sessionStorage
  async buildAuthorizeUrl(): Promise<string> {
    let state: string;
    let codeVerifier: string;
    let codeChallenge: string;
    try {
      state = generateState();
      ({ codeVerifier, codeChallenge } = await generatePkcePair());
    } catch (error) {
      throw toUaePassError(
        error,
        UaePassErrorCode.CryptoUnavailable,
        'Web Crypto is required for UAE PASS authentication'
      );
    }

    try {
      UaePassMemory.save({ state, codeVerifier, createdAt: Date.now() });
    } catch (error) {
      throw toUaePassError(
        error,
        UaePassErrorCode.StorageUnavailable,
        'Session storage is required for UAE PASS authentication'
      );
    }

    const params = new URLSearchParams({
      response_type: OAuthResponseType.Code,
      client_id: this.cfg.clientId,
      scope: this.cfg.scope ?? 'urn:uae:digitalid:profile:general',
      state,
      redirect_uri: this.cfg.redirectUri,
      ui_locales: this.cfg.language ?? UaePassLanguageCode.En,
      acr_values: UaePassAcr.Web, // Web ACR for browser apps
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    });

    return `${authorizeUrl(this.cfg.isProduction)}?${params.toString()}`;
  }

  // 2) Redirect the browser to UAE PASS
  async redirectToAuthorization(): Promise<void> {
    this._status.set(UaePassAuthStatus.Authorizing);
    this.resetError();
    try {
      const url = await this.buildAuthorizeUrl();
      if (typeof window !== 'undefined' && window?.location) {
        window.location.assign(url);
        return;
      }
      this.setError(
        new UaePassError(UaePassErrorCode.InvalidCallbackUrl, this.texts().windowNotAvailable)
      );
    } catch (error) {
      this.setError(
        toUaePassError(
          error,
          UaePassErrorCode.CryptoUnavailable,
          'Unable to start UAE PASS authentication'
        )
      );
    }
  }

  // 3) Handle callback on your redirect route. Provide url or it will use window.location.href
  async handleRedirectCallback(currentUrl?: string): Promise<void> {
    const href = currentUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (!href) {
      this.setError(
        new UaePassError(UaePassErrorCode.InvalidCallbackUrl, this.texts().noUrlContext)
      );
      return;
    }

    let url: URL;
    try {
      url = new URL(href);
      const expected = new URL(this.cfg.redirectUri);
      if (url.origin !== expected.origin || url.pathname !== expected.pathname) {
        throw new Error('Callback URL does not match the configured redirectUri');
      }
    } catch (error) {
      this.setError(
        toUaePassError(error, UaePassErrorCode.InvalidCallbackUrl, this.texts().noUrlContext)
      );
      return;
    }
    const returnedState = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (!code) {
      // If provider returned an error, surface it
      if (error) {
        this.setError(
          new UaePassError(
            UaePassErrorCode.AuthorizationFailed,
            `${error}${errorDescription ? `: ${errorDescription}` : ''}`
          )
        );
        if (returnedState) UaePassMemory.clear(returnedState);
        return;
      }
      // No-op if this is not the redirect URL
      return;
    }

    if (!returnedState) {
      this.setError(
        new UaePassError(UaePassErrorCode.StateMismatch, this.texts().securityCheckFailed)
      );
      return;
    }

    let transaction;
    try {
      transaction = UaePassMemory.load(returnedState);
    } catch (error) {
      this.setError(
        toUaePassError(error, UaePassErrorCode.StorageUnavailable, this.texts().securityCheckFailed)
      );
      return;
    }
    if (!transaction || Date.now() - transaction.createdAt > 10 * 60 * 1000) {
      UaePassMemory.clear(returnedState);
      this.setError(
        new UaePassError(UaePassErrorCode.StateMismatch, this.texts().securityCheckFailed)
      );
      return;
    }

    this._status.set(UaePassAuthStatus.ExchangingToken);

    try {
      const tokens = await this.exchangeToken(code, transaction.codeVerifier);
      this._tokens.set(tokens);
      saveTokens(this.storageMode(), this.cfg.clientId, tokens);
      this._status.set(UaePassAuthStatus.Authenticated);

      // Optionally fetch user info
      try {
        const profile = await this.fetchUserInfo(tokens.access_token);
        if (profile) {
          this._profile.set(profile);
          saveProfile(this.storageMode(), this.cfg.clientId, profile);
        }
      } catch {
        this._profile.set(null);
      }
    } catch (error) {
      this.setError(
        toUaePassError(
          error,
          UaePassErrorCode.TokenExchangeFailed,
          this.texts().tokenExchangeFailed
        )
      );
    } finally {
      UaePassMemory.clear(returnedState);
    }
  }

  // 4) Exchange code for tokens
  async exchangeToken(code: string, codeVerifier: string): Promise<UaePassTokens> {
    if (!codeVerifier) {
      throw new UaePassError(
        UaePassErrorCode.MissingTransaction,
        'Missing PKCE code verifier for token exchange'
      );
    }
    const tokens = await firstValueFrom(
      this.http
        .post<UaePassTokens>(this.cfg.tokenProxyUrl, {
          code,
          redirect_uri: this.cfg.redirectUri,
          code_verifier: codeVerifier,
        })
        .pipe(rxTimeout(this.requestTimeoutMs()))
    );
    if (!tokens?.access_token) {
      throw new UaePassError(
        UaePassErrorCode.TokenExchangeFailed,
        this.texts().tokenExchangeFailed
      );
    }
    return tokens;
  }

  // 5) Fetch user profile (optional)
  async fetchUserInfo(accessToken: string): Promise<UaePassUserProfile | null> {
    const profile = await firstValueFrom(
      this.http
        .post<UaePassUserProfile>(this.cfg.userInfoProxyUrl, { token: accessToken })
        .pipe(rxTimeout(this.requestTimeoutMs()))
    );
    return profile ?? null;
  }

  // 6) Logout: clear local state and logout from UAE Pass servers (official flow)
  logout(): void {
    this._status.set(UaePassAuthStatus.LoggedOut);
    this._tokens.set(null);
    this._profile.set(null);
    this._error.set(null);
    this._errorCode.set(null);
    clearAll(this.storageMode(), this.cfg.clientId);

    if (typeof window !== 'undefined' && window?.location) {
      // Use logoutRedirectUri if provided, otherwise use redirectUri
      const logoutUri = this.cfg.logoutRedirectUri || this.cfg.redirectUri;
      const url = logoutUrl(this.cfg.isProduction, logoutUri);
      window.location.assign(url);
    }
  }

  resetError(): void {
    this._error.set(null);
    this._errorCode.set(null);
  }
}
