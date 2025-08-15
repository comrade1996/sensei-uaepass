// Centralized enums for sensei-uaepass

export enum UaePassAuthStatus {
  Idle = 'idle',
  Authorizing = 'authorizing',
  ExchangingToken = 'exchangingToken',
  Authenticated = 'authenticated',
  Error = 'error',
  LoggedOut = 'loggedOut',
}

export enum UaePassStorageMode {
  None = 'none',
  Session = 'session',
  Local = 'local',
}

export enum UaePassAcr {
  MobileOnDevice = 'urn:digitalid:authentication:flow:mobileondevice',
  Web = 'urn:safelayer:tws:policies:authentication:level:low',
}

export enum UaePassLanguageCode {
  En = 'en',
  Ar = 'ar',
}

// Optional convenience if consumers prefer enums over booleans for environment
export enum UaePassEnvironment {
  Production = 'production',
  Staging = 'staging',
}

export enum OAuthResponseType {
  Code = 'code',
}

export enum CodeChallengeMethod {
  S256 = 'S256',
}

export enum OAuthGrantType {
  AuthorizationCode = 'authorization_code',
}
