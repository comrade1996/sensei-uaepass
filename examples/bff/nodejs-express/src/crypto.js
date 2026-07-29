const { createHash, randomBytes, timingSafeEqual } = require('node:crypto');

function randomBase64Url(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

function createOAuthTransaction(pkceEnabled = false, now = Date.now()) {
  const transaction = {
    state: randomBase64Url(32),
    createdAt: now,
  };
  if (!pkceEnabled) return transaction;

  const verifier = randomBase64Url(64);
  return {
    ...transaction,
    verifier,
    challenge: createHash('sha256').update(verifier).digest('base64url'),
  };
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = { createOAuthTransaction, randomBase64Url, safeEqual };
