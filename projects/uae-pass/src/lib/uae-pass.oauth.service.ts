import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout as rxTimeout } from 'rxjs/operators';

import { UAE_PASS_CONFIG } from './uae-pass.config';
import {
  authorizeUrl,
  tokenUrl,
  userInfoUrl,
  logoutUrl,
} from './uae-pass.constants';
import { UaePassTokens, UaePassUserProfile } from './uae-pass.types';
import {
  UaePassAuthStatus,
  UaePassAcr,
  UaePassLanguageCode,
  OAuthResponseType,
  CodeChallengeMethod,
  OAuthGrantType,
} from './uae-pass.enums';
import { UaePassMemory } from './uae-pass.memory';
import { generateState, generatePkcePair } from './uae-pass.pkce';
import {
  clearAll,
  loadProfile,
  loadTokens,
  saveProfile,
  saveTokens,
} from './uae-pass.storage';
import { getUaePassTexts } from './uae-pass.i18n';

@Injectable({ providedIn: 'root' })
export class UaePassAuthService {
  private readonly http = inject(HttpClient);
  private readonly cfg = inject(UAE_PASS_CONFIG);

  // Signals-based state
  private readonly _status = signal<UaePassAuthStatus>(UaePassAuthStatus.Idle);
  private readonly _tokens = signal<UaePassTokens | null>(null);
  private readonly _profile = signal<UaePassUserProfile | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly status = this._status.asReadonly();
  readonly tokens = this._tokens.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly error = this._error.asReadonly();

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
    // Restore from storage if configured
    const tokens = loadTokens(this.storageMode());
    if (tokens) {
      this._tokens.set(tokens);
      const profile = loadProfile(this.storageMode());
      if (profile) this._profile.set(profile);
      this._status.set(UaePassAuthStatus.Authenticated);
    }
  }

  // 1) Build UAE PASS authorize URL with PKCE + state; store ephemeral values in sessionStorage
  async buildAuthorizeUrl(): Promise<string> {
    const state = generateState();
    const { codeVerifier, codeChallenge } = await generatePkcePair();

    UaePassMemory.setState(state);
    UaePassMemory.setCodeVerifier(codeVerifier);

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
    const url = await this.buildAuthorizeUrl();
    if (typeof window !== 'undefined' && window?.location) {
      window.location.assign(url);
    } else {
      this._status.set(UaePassAuthStatus.Error);
      this._error.set(this.texts().windowNotAvailable);
    }
  }

  // 3) Handle callback on your redirect route. Provide url or it will use window.location.href
  async handleRedirectCallback(currentUrl?: string): Promise<void> {
    const href =
      currentUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (!href) {
      this._status.set(UaePassAuthStatus.Error);
      this._error.set(this.texts().noUrlContext);
      return;
    }

    const url = new URL(href);
    const returnedState = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (!code) {
      // If provider returned an error, surface it
      if (error) {
        this._status.set(UaePassAuthStatus.Error);
        this._error.set(
          `${error}${
            errorDescription ? `: ${decodeURIComponent(errorDescription)}` : ''
          }`
        );
        UaePassMemory.clear();
        return;
      }
      // No-op if this is not the redirect URL
      return;
    }

    const expectedState = UaePassMemory.getState();
    if (!expectedState || returnedState !== expectedState) {
      this._status.set(UaePassAuthStatus.Error);
      this._error.set(this.texts().securityCheckFailed);
      // Clear ephemeral state to avoid reuse
      UaePassMemory.clear();
      return;
    }

    this._status.set(UaePassAuthStatus.ExchangingToken);

    try {
      const tokens = await this.exchangeToken(code);
      this._tokens.set(tokens);
      saveTokens(this.storageMode(), tokens);
      this._status.set(UaePassAuthStatus.Authenticated);

      // Optionally fetch user info
      try {
        const profile = await this.fetchUserInfo(tokens.access_token);
        if (profile) {
          this._profile.set(profile);
          saveProfile(this.storageMode(), profile);
        } else {
          console.warn(`UAE Pass: ${this.texts().noUserProfile}`);
        }
      } catch (e) {
        console.error(`UAE Pass: ${this.texts().userProfileFetchFailed}:`, e);
        // Non-fatal - user is still authenticated even without profile
      }
    } catch (e) {
      this._status.set(UaePassAuthStatus.Error);
      this._error.set(e instanceof Error ? e.message : String(e));
    } finally {
      UaePassMemory.clear();
    }
  }

  // 4) Exchange code for tokens
  async exchangeToken(code: string): Promise<UaePassTokens> {
    const verifier = UaePassMemory.getCodeVerifier() ?? '';

    // If a proxy is configured, prefer it (avoids exposing client_secret in the browser)
    if (this.cfg.tokenProxyUrl) {
      const body = {
        code,
        redirect_uri: this.cfg.redirectUri,
        code_verifier: verifier,
      } as const;

      const tokens = await firstValueFrom(
        this.http
          .post<UaePassTokens>(this.cfg.tokenProxyUrl, body)
          .pipe(rxTimeout(this.requestTimeoutMs()))
      );

      if (!tokens?.access_token)
        throw new Error(this.texts().tokenExchangeFailed);
      return tokens;
    }

    // Direct call to UAE PASS token endpoint (only safe if your tenant allows public SPA flow without secret)
    const tokenEndpoint = tokenUrl(this.cfg.isProduction);

    const params = new URLSearchParams();
    params.set('redirect_uri', this.cfg.redirectUri);
    params.set('client_id', this.cfg.clientId);
    params.set('grant_type', OAuthGrantType.AuthorizationCode);
    params.set('code', code);
    params.set('code_verifier', verifier);
    if (this.cfg.clientSecret) {
      params.set('client_secret', this.cfg.clientSecret);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const tokens = await firstValueFrom(
      this.http
        .post<UaePassTokens>(tokenEndpoint, params.toString(), { headers })
        .pipe(rxTimeout(this.requestTimeoutMs()))
    );

    if (!tokens?.access_token) throw new Error(this.texts().tokenExchangeFailed);
    return tokens;
  }

  // 5) Fetch user profile (optional)
  async fetchUserInfo(accessToken: string): Promise<UaePassUserProfile | null> {
    if (this.cfg.userInfoProxyUrl) {
      const profile = await firstValueFrom(
        this.http
          .post<UaePassUserProfile>(this.cfg.userInfoProxyUrl, {
            token: accessToken,
          })
          .pipe(rxTimeout(this.requestTimeoutMs()))
      );
      return profile ?? null;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${accessToken}`,
    });

    const url = userInfoUrl(this.cfg.isProduction);
    const profile = await firstValueFrom(
      this.http
        .get<UaePassUserProfile>(url, { headers })
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
    clearAll(this.storageMode());
    UaePassMemory.clear();

    if (typeof window !== 'undefined' && window?.location) {
      // Use logoutRedirectUri if provided, otherwise use redirectUri
      const logoutUri = this.cfg.logoutRedirectUri || this.cfg.redirectUri;
      const url = logoutUrl(this.cfg.isProduction, logoutUri);
      window.location.assign(url);
    }
  }

  resetError(): void {
    this._error.set(null);
  }
}
