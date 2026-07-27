import type { UaePassConfig } from './uae-pass.config';
import { validateUaePassConfig } from './uae-pass.config';

const validConfig: UaePassConfig = {
  clientId: 'client',
  redirectUri: 'https://app.example.com/callback',
  isProduction: false,
  tokenProxyUrl: 'https://api.example.com/token',
  userInfoProxyUrl: 'https://api.example.com/userinfo',
};

describe('validateUaePassConfig', () => {
  it('returns an immutable copy of valid configuration', () => {
    const result = validateUaePassConfig(validConfig);

    expect(result).not.toBe(validConfig);
    expect(Object.isFrozen(result)).toBeTrue();
  });

  it('requires client and proxy endpoint values', () => {
    expect(() => validateUaePassConfig({ ...validConfig, clientId: '' })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, redirectUri: '' })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, tokenProxyUrl: '' })).toThrow();
    expect(() => validateUaePassConfig({ ...validConfig, userInfoProxyUrl: '' })).toThrow();
  });

  it('requires positive request timeouts', () => {
    expect(() => validateUaePassConfig({ ...validConfig, requestTimeoutMs: 0 })).toThrow();
  });
});
