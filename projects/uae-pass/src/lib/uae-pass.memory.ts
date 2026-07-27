// Ephemeral storage across redirect for PKCE + state
// Uses sessionStorage to survive full-page redirects and be cleared easily.

const PREFIX = 'uae-pass:transaction:' as const;

export interface UaePassTransaction {
  state: string;
  codeVerifier: string;
  createdAt: number;
}

function getStore(): Storage {
  if (typeof sessionStorage === 'undefined') {
    throw new Error('Session storage is required to complete UAE PASS authentication');
  }
  return sessionStorage;
}

function key(state: string): string {
  return `${PREFIX}${encodeURIComponent(state)}`;
}

export const UaePassMemory = {
  save(transaction: UaePassTransaction): void {
    getStore().setItem(key(transaction.state), JSON.stringify(transaction));
  },
  load(state: string): UaePassTransaction | null {
    const raw = getStore().getItem(key(state));
    if (!raw) return null;
    try {
      const transaction = JSON.parse(raw) as Partial<UaePassTransaction>;
      if (
        transaction.state !== state ||
        typeof transaction.codeVerifier !== 'string' ||
        typeof transaction.createdAt !== 'number'
      ) {
        return null;
      }
      return transaction as UaePassTransaction;
    } catch {
      return null;
    }
  },
  clear(state: string): void {
    getStore().removeItem(key(state));
  },
};
