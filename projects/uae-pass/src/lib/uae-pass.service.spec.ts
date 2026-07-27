import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { UaePassConfig } from './uae-pass.config';
import { UAE_PASS_CONFIG } from './uae-pass.config';
import { UaePassErrorCode } from './uae-pass.error';
import { UaePassAuthStatus } from './uae-pass.enums';
import { UaePassAuthService } from './uae-pass.oauth.service';

const config: UaePassConfig = {
  clientId: 'test-client',
  redirectUri: 'https://app.example.com/auth/callback',
  isProduction: false,
  tokenProxyUrl: 'https://api.example.com/uae-pass/token',
  userInfoProxyUrl: 'https://api.example.com/uae-pass/userinfo',
  storage: 'none',
  language: 'en',
};

describe('UaePassAuthService', () => {
  let service: UaePassAuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UAE_PASS_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(UaePassAuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts in the idle state without persisted tokens', () => {
    expect(service.status()).toBe(UaePassAuthStatus.Idle);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('builds an authorization URL with PKCE and stores its transaction by state', async () => {
    const result = new URL(await service.buildAuthorizeUrl());
    const state = result.searchParams.get('state');

    expect(result.origin).toBe('https://stg-id.uaepass.ae');
    expect(result.searchParams.get('client_id')).toBe(config.clientId);
    expect(result.searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(result.searchParams.get('code_challenge_method')).toBe('S256');
    expect(result.searchParams.get('code_challenge')).toBeTruthy();
    expect(state).toBeTruthy();
    expect(
      sessionStorage.getItem(`uae-pass:transaction:${encodeURIComponent(state!)}`)
    ).toBeTruthy();
  });

  it('exchanges authorization codes only through the configured backend proxy', async () => {
    const result = service.exchangeToken('authorization-code', 'verifier');
    const request = http.expectOne(config.tokenProxyUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      code: 'authorization-code',
      redirect_uri: config.redirectUri,
      code_verifier: 'verifier',
    });
    request.flush({ access_token: 'access-token', expires_in: 3600 });

    await expectAsync(result).toBeResolvedTo(
      jasmine.objectContaining({ access_token: 'access-token' })
    );
  });

  it('rejects token exchange without a PKCE verifier', async () => {
    await expectAsync(service.exchangeToken('authorization-code', '')).toBeRejectedWithError(
      /Missing PKCE code verifier/
    );
  });

  it('rejects callbacks that do not match the configured redirect URI', async () => {
    await service.handleRedirectCallback('https://attacker.example/callback?code=x&state=y');

    expect(service.status()).toBe(UaePassAuthStatus.Error);
    expect(service.errorCode()).toBe(UaePassErrorCode.InvalidCallbackUrl);
  });

  it('surfaces authorization errors with a typed error code', async () => {
    await service.handleRedirectCallback(
      `${config.redirectUri}?error=access_denied&error_description=User%20cancelled`
    );

    expect(service.status()).toBe(UaePassAuthStatus.Error);
    expect(service.errorCode()).toBe(UaePassErrorCode.AuthorizationFailed);
    expect(service.error()).toContain('User cancelled');
  });

  it('rejects callbacks whose state has no active transaction', async () => {
    await service.handleRedirectCallback(`${config.redirectUri}?code=x&state=unknown`);

    expect(service.status()).toBe(UaePassAuthStatus.Error);
    expect(service.errorCode()).toBe(UaePassErrorCode.StateMismatch);
  });

  it('completes a valid callback and fetches the profile through the backend', async () => {
    sessionStorage.setItem(
      'uae-pass:transaction:valid-state',
      JSON.stringify({ state: 'valid-state', codeVerifier: 'verifier', createdAt: Date.now() })
    );

    const result = service.handleRedirectCallback(
      `${config.redirectUri}?code=authorization-code&state=valid-state`
    );
    http.expectOne(config.tokenProxyUrl).flush({ access_token: 'access-token', expires_in: 3600 });
    await new Promise<void>((resolve) => setTimeout(resolve));
    http.expectOne(config.userInfoProxyUrl).flush({ sub: 'user-1', fullnameEN: 'Test User' });
    await result;

    expect(service.status()).toBe(UaePassAuthStatus.Authenticated);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.profile()?.sub).toBe('user-1');
    expect(sessionStorage.getItem('uae-pass:transaction:valid-state')).toBeNull();
  });
});
