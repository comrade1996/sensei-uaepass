import type { UaePassConfig } from './uae-pass.config';
import { validateUaePassConfig } from './uae-pass.config';

const validConfig: UaePassConfig = {
  loginUrl: '/auth/uae-pass/login',
  sessionUrl: '/api/session',
  logoutUrl: '/auth/logout',
};

describe('validateUaePassConfig', () => {
  it('returns an immutable copy of valid configuration', () => {
    const result = validateUaePassConfig(validConfig);

    expect(result).not.toBe(validConfig);
    expect(Object.isFrozen(result)).toBeTrue();
  });

  it('requires every BFF endpoint', () => {
    expect(() => validateUaePassConfig({ ...validConfig, loginUrl: '' })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, sessionUrl: '' })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, logoutUrl: '' })).toThrow();
  });

  it('rejects script URLs and invalid timeouts', () => {
    expect(() =>
      validateUaePassConfig({ ...validConfig, loginUrl: 'javascript:alert(1)' })
    ).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, requestTimeoutMs: 0 })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, requestTimeoutMs: NaN })).toThrow();
  });

  it('validates optional language and accepts a positive timeout', () => {
    expect(
      validateUaePassConfig({ ...validConfig, language: 'ar', requestTimeoutMs: 5_000 })
    ).toEqual(jasmine.objectContaining({ language: 'ar', requestTimeoutMs: 5_000 }));
    expect(() =>
      validateUaePassConfig({
        ...validConfig,
        language: 'fr' as unknown as UaePassConfig['language'],
      })
    ).toThrow();
  });
});
