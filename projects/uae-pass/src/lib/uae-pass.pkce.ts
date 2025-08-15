// PKCE and state utilities for UAE PASS OAuth 2.0
// Mirrors behavior of Flutter implementation (random state, S256 code challenge)

const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function randomString(length: number, charset = PKCE_CHARSET): string {
  const result: string[] = [];
  const cryptoObj = globalThis.crypto || (globalThis as unknown as { msCrypto?: Crypto }).msCrypto;
  if (!cryptoObj) {
    // Non-cryptographic fallback; consumers should polyfill crypto in SSR if needed
    for (let i = 0; i < length; i++) {
      result.push(charset[Math.floor(Math.random() * charset.length)]);
    }
    return result.join('');
  }

  const rnd = new Uint8Array(length);
  cryptoObj.getRandomValues(rnd);
  for (let i = 0; i < length; i++) {
    result.push(charset[rnd[i] % charset.length]);
  }
  return result.join('');
}

export function generateState(length = 32): string {
  return randomString(length);
}

function base64Encode(bytes: Uint8Array): string {
  // Avoid relying on btoa (not available in Node/SSR). Encode manually with correct padding.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < bytes.length) {
    const o1 = bytes[i++];
    const o2 = i < bytes.length ? bytes[i++] : NaN;
    const o3 = i < bytes.length ? bytes[i++] : NaN;

    const c1 = o1 >> 2;
    const c2 = ((o1 & 0x03) << 4) | (isNaN(o2) ? 0 : ((o2 as number) >> 4));
    const c3 = isNaN(o2) ? 64 : (((o2 as number) & 0x0f) << 2) | (isNaN(o3) ? 0 : ((o3 as number) >> 6));
    const c4 = isNaN(o3) ? 64 : ((o3 as number) & 0x3f);

    output += chars[c1] + chars[c2] + chars[c3] + chars[c4];
  }
  return output;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = base64Encode(bytes);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const cryptoObj: Crypto | undefined = (globalThis as any).crypto ?? (globalThis as any).msCrypto;
  if (!cryptoObj?.subtle) {
    throw new Error('WebCrypto SubtleCrypto is not available');
  }
  const digest = await cryptoObj.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

export async function generateCodeChallengeS256(codeVerifier: string): Promise<string> {
  const hash = await sha256(codeVerifier);
  return base64UrlEncode(hash);
}

export async function generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string; }>{
  const codeVerifier = randomString(64);
  const codeChallenge = await generateCodeChallengeS256(codeVerifier);
  return { codeVerifier, codeChallenge };
}
