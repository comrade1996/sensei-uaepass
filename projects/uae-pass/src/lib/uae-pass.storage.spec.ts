import { UaePassStorageMode } from './uae-pass.enums';
import { clearAll, loadProfile, loadTokens, saveProfile, saveTokens } from './uae-pass.storage';

describe('UAE PASS storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('stores data under a client-specific namespace', () => {
    saveTokens(UaePassStorageMode.Session, 'client-a', {
      access_token: 'token-a',
      expires_in: 3600,
    });
    saveTokens(UaePassStorageMode.Session, 'client-b', {
      access_token: 'token-b',
      expires_in: 3600,
    });

    expect(loadTokens(UaePassStorageMode.Session, 'client-a')?.access_token).toBe('token-a');
    expect(loadTokens(UaePassStorageMode.Session, 'client-b')?.access_token).toBe('token-b');
  });

  it('removes expired token data', () => {
    sessionStorage.setItem(
      'uae-pass:client:tokens',
      JSON.stringify({ tokens: { access_token: 'expired' }, expiresAt: Date.now() - 1 })
    );

    expect(loadTokens(UaePassStorageMode.Session, 'client')).toBeNull();
    expect(sessionStorage.getItem('uae-pass:client:tokens')).toBeNull();
  });

  it('rejects malformed persisted values', () => {
    sessionStorage.setItem('uae-pass:client:tokens', '{bad-json');
    sessionStorage.setItem('uae-pass:client:profile', '[]');

    expect(loadTokens(UaePassStorageMode.Session, 'client')).toBeNull();
    expect(loadProfile(UaePassStorageMode.Session, 'client')).toBeNull();
  });

  it('stores and clears a profile with its tokens', () => {
    saveTokens(UaePassStorageMode.Local, 'client', { access_token: 'token' });
    saveProfile(UaePassStorageMode.Local, 'client', { sub: 'user' });

    expect(loadProfile(UaePassStorageMode.Local, 'client')?.sub).toBe('user');
    clearAll(UaePassStorageMode.Local, 'client');
    expect(loadTokens(UaePassStorageMode.Local, 'client')).toBeNull();
    expect(loadProfile(UaePassStorageMode.Local, 'client')).toBeNull();
  });

  it('does not persist data when storage mode is none', () => {
    saveTokens(UaePassStorageMode.None, 'client', { access_token: 'token' });

    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
  });
});
