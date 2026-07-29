import { generateCodeChallengeS256, generatePkcePair, generateState } from './uae-pass.pkce';

describe('UAE PASS PKCE utilities', () => {
  it('matches the RFC 7636 S256 example', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    await expectAsync(generateCodeChallengeS256(verifier)).toBeResolvedTo(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
  });

  it('creates state with the requested length and PKCE-safe characters', () => {
    const state = generateState(48);

    expect(state).toMatch(/^[A-Za-z0-9._~-]{48}$/);
  });

  it('creates a verifier and challenge pair', async () => {
    const pair = await generatePkcePair();

    expect(pair.codeVerifier).toMatch(/^[A-Za-z0-9._~-]{64}$/);
    expect(pair.codeChallenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('rejects invalid state lengths', () => {
    expect(() => generateState(0)).toThrowError(RangeError);
  });
});
