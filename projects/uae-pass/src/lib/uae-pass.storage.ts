import type { UaePassTokens, UaePassUserProfile } from './uae-pass.types';
import type { UaePassStorageMode } from './uae-pass.enums';

const PREFIX = 'uae-pass:' as const;
type UaePassStorageModeLike = UaePassStorageMode | 'none' | 'session' | 'local';

interface StoredTokens {
  tokens: UaePassTokens;
  expiresAt: number | null;
}

function key(clientId: string, name: 'tokens' | 'profile'): string {
  return `${PREFIX}${encodeURIComponent(clientId)}:${name}`;
}

function getStore(mode: UaePassStorageModeLike): Storage | null {
  if (typeof window === 'undefined' || mode === 'none') return null;
  try {
    return mode === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function isTokens(value: unknown): value is UaePassTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { access_token?: unknown }).access_token === 'string'
  );
}

function isProfile(value: unknown): value is UaePassUserProfile {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function saveTokens(
  mode: UaePassStorageModeLike,
  clientId: string,
  tokens: UaePassTokens | null
): void {
  const store = getStore(mode);
  if (!store) return;
  const tokensKey = key(clientId, 'tokens');
  if (!tokens) {
    store.removeItem(tokensKey);
    return;
  }
  const expiresAt =
    typeof tokens.expires_in === 'number' && tokens.expires_in > 0
      ? Date.now() + tokens.expires_in * 1000
      : null;
  store.setItem(tokensKey, JSON.stringify({ tokens, expiresAt } satisfies StoredTokens));
}

export function loadTokens(mode: UaePassStorageModeLike, clientId: string): UaePassTokens | null {
  const store = getStore(mode);
  if (!store) return null;
  const tokensKey = key(clientId, 'tokens');
  try {
    const raw = store.getItem(tokensKey);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredTokens>;
    if (!isTokens(stored.tokens)) {
      store.removeItem(tokensKey);
      return null;
    }
    if (typeof stored.expiresAt === 'number' && stored.expiresAt <= Date.now()) {
      store.removeItem(tokensKey);
      return null;
    }
    return stored.tokens;
  } catch {
    store.removeItem(tokensKey);
    return null;
  }
}

export function saveProfile(
  mode: UaePassStorageModeLike,
  clientId: string,
  profile: UaePassUserProfile | null
): void {
  const store = getStore(mode);
  if (!store) return;
  const profileKey = key(clientId, 'profile');
  if (!profile) {
    store.removeItem(profileKey);
    return;
  }
  store.setItem(profileKey, JSON.stringify(profile));
}

export function loadProfile(
  mode: UaePassStorageModeLike,
  clientId: string
): UaePassUserProfile | null {
  const store = getStore(mode);
  if (!store) return null;
  const profileKey = key(clientId, 'profile');
  try {
    const raw = store.getItem(profileKey);
    if (!raw) return null;
    const profile: unknown = JSON.parse(raw);
    if (!isProfile(profile)) {
      store.removeItem(profileKey);
      return null;
    }
    return profile;
  } catch {
    store.removeItem(profileKey);
    return null;
  }
}

export function clearAll(mode: UaePassStorageModeLike, clientId: string): void {
  const store = getStore(mode);
  if (!store) return;
  store.removeItem(key(clientId, 'tokens'));
  store.removeItem(key(clientId, 'profile'));
}
