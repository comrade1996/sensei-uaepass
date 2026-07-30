import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { UaePassConfig } from './uae-pass.config';
import { UAE_PASS_CONFIG } from './uae-pass.config';
import { UaePassAuthStatus } from './uae-pass.enums';
import { UaePassErrorCode } from './uae-pass.error';
import { buildLoginUrl, localReturnPath, UaePassAuthService } from './uae-pass-auth.service';

const config: UaePassConfig = {
  loginUrl: '/auth/uae-pass/login',
  sessionUrl: '/api/session',
  logoutUrl: '/auth/logout',
  autoRestoreSession: false,
  language: 'en',
};

describe('UaePassAuthService', () => {
  let service: UaePassAuthService;
  let http: HttpTestingController;

  beforeEach(() => {
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

  it('starts unauthenticated without browser persistence', () => {
    expect(service.status()).toBe(UaePassAuthStatus.Idle);
    expect(service.profile()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('builds safe English and Arabic UAE PASS login URLs', () => {
    expect(localReturnPath('https://attacker.example')).toBe('/');
    expect(localReturnPath('//attacker.example')).toBe('/');
    expect(localReturnPath('/\\attacker.example')).toBe('/');
    expect(
      buildLoginUrl('/auth/uae-pass/login', 'https://app.example', '/current', '/account', 'en')
    ).toBe('https://app.example/auth/uae-pass/login?returnTo=%2Faccount&ui_locales=en');
    expect(
      buildLoginUrl('/auth/uae-pass/login', 'https://app.example', '/current', undefined, 'ar')
    ).toBe('https://app.example/auth/uae-pass/login?returnTo=%2Fcurrent&ui_locales=ar');
  });

  it('restores a validated BFF session with credentials', async () => {
    const result = service.restoreSession();
    const request = http.expectOne(config.sessionUrl);

    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({
      authenticated: true,
      profile: { sub: 'user-1', fullnameEN: 'Test User' },
      csrfToken: 'csrf-token',
    });

    await expectAsync(result).toBeResolvedTo(true);
    expect(service.status()).toBe(UaePassAuthStatus.Authenticated);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.profile()?.sub).toBe('user-1');
  });

  it('does not authenticate an invalid or incomplete identity', async () => {
    const result = service.restoreSession();
    http.expectOne(config.sessionUrl).flush({
      authenticated: true,
      profile: { fullnameEN: 'No stable subject' },
      csrfToken: 'csrf-token',
    });

    await expectAsync(result).toBeResolvedTo(false);
    expect(service.status()).toBe(UaePassAuthStatus.Error);
    expect(service.errorCode()).toBe(UaePassErrorCode.InvalidSessionResponse);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('rejects an authenticated response with an empty CSRF token', async () => {
    const result = service.restoreSession();
    http.expectOne(config.sessionUrl).flush({
      authenticated: true,
      profile: { sub: 'user-1' },
      csrfToken: ' ',
    });

    await expectAsync(result).toBeResolvedTo(false);
    expect(service.errorCode()).toBe(UaePassErrorCode.InvalidSessionResponse);
  });

  it('represents an anonymous session without an error', async () => {
    const result = service.restoreSession();
    http.expectOne(config.sessionUrl).flush({ authenticated: false, profile: null });

    await expectAsync(result).toBeResolvedTo(false);
    expect(service.status()).toBe(UaePassAuthStatus.Idle);
    expect(service.error()).toBeNull();
  });

  it('accepts an anonymous response without a profile property', async () => {
    const result = service.restoreSession();
    http.expectOne(config.sessionUrl).flush({ authenticated: false });

    await expectAsync(result).toBeResolvedTo(false);
    expect(service.status()).toBe(UaePassAuthStatus.Idle);
  });

  it('fails closed when session restoration returns an HTTP error', async () => {
    const result = service.restoreSession();
    http
      .expectOne(config.sessionUrl)
      .flush({ error: 'unavailable' }, { status: 503, statusText: 'Unavailable' });

    await expectAsync(result).toBeResolvedTo(false);
    expect(service.errorCode()).toBe(UaePassErrorCode.SessionFetchFailed);
    expect(service.profile()).toBeNull();
  });

  it('sends the in-memory CSRF token when logging out', async () => {
    const restored = service.restoreSession();
    http.expectOne(config.sessionUrl).flush({
      authenticated: true,
      profile: { sub: 'user-1' },
      csrfToken: 'csrf-token',
    });
    await restored;

    const result = service.logout();
    const request = http.expectOne(config.logoutUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.get('X-CSRF-Token')).toBe('csrf-token');
    request.flush({ loggedOut: true });
    await result;

    expect(service.status()).toBe(UaePassAuthStatus.LoggedOut);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('never exposes token data in its public state', () => {
    expect('tokens' in (service as unknown as Record<string, unknown>)).toBeFalse();
  });
});
