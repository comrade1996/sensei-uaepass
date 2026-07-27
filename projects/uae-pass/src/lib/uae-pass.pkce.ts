// PKCE and state utilities for UAE PASS OAuth 2.0
// Mirrors behavior of Flutter implementation (random state, S256 code challenge)

const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function getCrypto(): Crypto {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues || !cryptoObj.subtle) {
    throw new Error('Web Crypto is required for UAE PASS authentication');
  }
  return cryptoObj;
}

function randomString(length: number, charset = PKCE_CHARSET): string {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('Random string length must be a positive integer');
  }

  const cryptoObj = getCrypto();
  const result: string[] = [];
  const maximumValidByte = Math.floor(256 / charset.length) * charset.length;

  while (result.length < length) {
    const randomBytes = new Uint8Array(Math.max(32, length - result.length));
    cryptoObj.getRandomValues(randomBytes);
    for (const byte of randomBytes) {
      if (byte < maximumValidByte) {
        result.push(charset[byte % charset.length]);
        if (result.length === length) break;
      }
    }
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
    const c2 = ((o1 & 0x03) << 4) | (isNaN(o2) ? 0 : (o2 as number) >> 4);
    const c3 = isNaN(o2)
      ? 64
      : (((o2 as number) & 0x0f) << 2) | (isNaN(o3) ? 0 : (o3 as number) >> 6);
    const c4 = isNaN(o3) ? 64 : (o3 as number) & 0x3f;

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
  const digest = await getCrypto().subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

export async function generateCodeChallengeS256(codeVerifier: string): Promise<string> {
  const hash = await sha256(codeVerifier);
  return base64UrlEncode(hash);
}

export async function generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = randomString(64);
  const codeChallenge = await generateCodeChallengeS256(codeVerifier);
  return { codeVerifier, codeChallenge };
}
