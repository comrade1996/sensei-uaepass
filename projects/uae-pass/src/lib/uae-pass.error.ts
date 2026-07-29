export enum UaePassErrorCode {
  InvalidConfiguration = 'invalid_configuration',
  RedirectUnavailable = 'redirect_unavailable',
  SessionFetchFailed = 'session_fetch_failed',
  InvalidSessionResponse = 'invalid_session_response',
  AuthorizationFailed = 'authorization_failed',
  LogoutFailed = 'logout_failed',
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
