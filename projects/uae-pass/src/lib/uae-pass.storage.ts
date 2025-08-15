import { UaePassTokens, UaePassUserProfile } from './uae-pass.types';
import { UaePassStorageMode } from './uae-pass.enums';

const PREFIX = 'uae-pass:' as const;
const TOKENS_KEY = `${PREFIX}tokens` as const;
const PROFILE_KEY = `${PREFIX}profile` as const;

type UaePassStorageModeLike = UaePassStorageMode | 'none' | 'session' | 'local';

function normalizeMode(mode: UaePassStorageModeLike): 'none' | 'session' | 'local' {
  // Enum values are already the exact string values
  if (mode === 'session' || mode === 'local' || mode === 'none') return mode;
  // Typescript enum runtime value is the string literal as well
  return mode as unknown as 'none' | 'session' | 'local';
}

function getStore(mode: UaePassStorageModeLike): Storage | null {
  const m = normalizeMode(mode);
  if (typeof window === 'undefined') return null;
  try {
    if (m === 'session') return window.sessionStorage ?? null;
    if (m === 'local') return window.localStorage ?? null;
  } catch {
    // Storage may be blocked
  }
  return null;
}

export function saveTokens(mode: UaePassStorageModeLike, tokens: UaePassTokens | null): void {
  const store = getStore(mode);
  if (!store) return;
  if (!tokens) {
    try { store.removeItem(TOKENS_KEY); } catch {}
    return;
  }
  try { store.setItem(TOKENS_KEY, JSON.stringify(tokens)); } catch {}
}

export function loadTokens(mode: UaePassStorageModeLike): UaePassTokens | null {
  const store = getStore(mode);
  if (!store) return null;
  try {
    const raw = store.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as UaePassTokens) : null;
  } catch {
    return null;
  }
}

export function saveProfile(mode: UaePassStorageModeLike, profile: UaePassUserProfile | null): void {
  const store = getStore(mode);
  if (!store) return;
  if (!profile) {
    try { store.removeItem(PROFILE_KEY); } catch {}
    return;
  }
  try { store.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

export function loadProfile(mode: UaePassStorageModeLike): UaePassUserProfile | null {
  const store = getStore(mode);
  if (!store) return null;
  try {
    const raw = store.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UaePassUserProfile) : null;
  } catch {
    return null;
  }
}

export function clearAll(mode: UaePassStorageModeLike): void {
  const store = getStore(mode);
  if (!store) return;
  try {
    store.removeItem(TOKENS_KEY);
    store.removeItem(PROFILE_KEY);
  } catch {}
}
