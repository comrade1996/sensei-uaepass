// Ephemeral storage across redirect for PKCE + state
// Uses sessionStorage to survive full-page redirects and be cleared easily.

const PREFIX = 'uae-pass:' as const;

function key(name: string) {
  return `${PREFIX}${name}`;
}

export const UaePassMemory = {
  setState(state: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key('state'), state);
  },
  getState(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(key('state'));
  },
  setCodeVerifier(verifier: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key('code_verifier'), verifier);
  },
  getCodeVerifier(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(key('code_verifier'));
  },
  clear(): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(key('state'));
    sessionStorage.removeItem(key('code_verifier'));
  },
};
