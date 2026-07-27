export enum UaePassErrorCode {
  InvalidConfiguration = 'invalid_configuration',
  CryptoUnavailable = 'crypto_unavailable',
  StorageUnavailable = 'storage_unavailable',
  MissingTransaction = 'missing_transaction',
  InvalidCallbackUrl = 'invalid_callback_url',
  StateMismatch = 'state_mismatch',
  TokenExchangeFailed = 'token_exchange_failed',
  AuthorizationFailed = 'authorization_failed',
}

export class UaePassError extends Error {
  override readonly name = 'UaePassError';

  constructor(
    readonly code: UaePassErrorCode,
    message: string,
    readonly originalError?: unknown
  ) {
    super(message);
  }
}

export function toUaePassError(
  error: unknown,
  code: UaePassErrorCode,
  fallbackMessage: string
): UaePassError {
  if (error instanceof UaePassError) return error;
  if (error instanceof Error) return new UaePassError(code, error.message, error);
  return new UaePassError(code, fallbackMessage, error);
}
