class UpstreamError extends Error {
  constructor(code, status = 502) {
    super(code);
    this.name = 'UpstreamError';
    this.code = code;
    this.status = status;
  }
}

function validateTokens(value) {
  if (!value || typeof value !== 'object') throw new UpstreamError('invalid_token_response');
  if (typeof value.access_token !== 'string' || !value.access_token.trim()) {
    throw new UpstreamError('invalid_token_response');
  }
  if (
    typeof value.expires_in !== 'number' ||
    !Number.isFinite(value.expires_in) ||
    value.expires_in <= 0
  ) {
    throw new UpstreamError('invalid_token_expiry');
  }
  if (typeof value.token_type !== 'string' || value.token_type.toLowerCase() !== 'bearer') {
    throw new UpstreamError('invalid_token_type');
  }
  return value;
}

function validateProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new UpstreamError('invalid_userinfo_response');
  }
  if (typeof value.sub !== 'string' || !value.sub.trim()) {
    throw new UpstreamError('missing_subject');
  }
  return value;
}

function minimizeProfile(profile) {
  return {
    sub: profile.sub,
    ...(typeof profile.fullnameEN === 'string' ? { fullnameEN: profile.fullnameEN } : {}),
    ...(typeof profile.fullnameAR === 'string' ? { fullnameAR: profile.fullnameAR } : {}),
  };
}

class UaePassClient {
  constructor(config, fetchImpl = globalThis.fetch) {
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required');
    this.config = config;
    this.fetch = fetchImpl;
  }

  async exchangeCode(code, verifier) {
    const tokenUrl = new URL(this.config.tokenUrl);
    tokenUrl.search = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      ...(verifier ? { code_verifier: verifier } : {}),
    }).toString();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data; charset=UTF-8',
      Authorization: `Basic ${Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
        'utf8'
      ).toString('base64')}`,
    };

    return validateTokens(
      await this.requestJson(tokenUrl.toString(), {
        method: 'POST',
        headers,
      })
    );
  }

  async fetchUserInfo(accessToken) {
    return validateProfile(
      await this.requestJson(this.config.userInfoUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`,
        },
      })
    );
  }

  async requestJson(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.upstreamTimeoutMs);

    try {
      const response = await this.fetch(url, { ...options, signal: controller.signal });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new UpstreamError('invalid_upstream_content_type');
      }
      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > this.config.maxUpstreamBytes) {
        throw new UpstreamError('upstream_response_too_large');
      }
      const text = await response.text();
      if (Buffer.byteLength(text, 'utf8') > this.config.maxUpstreamBytes) {
        throw new UpstreamError('upstream_response_too_large');
      }
      if (!response.ok) throw new UpstreamError('upstream_rejected_request', 502);
      try {
        return JSON.parse(text);
      } catch {
        throw new UpstreamError('invalid_upstream_json');
      }
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error?.name === 'AbortError') throw new UpstreamError('upstream_timeout', 504);
      throw new UpstreamError('upstream_unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = { UaePassClient, UpstreamError, minimizeProfile };
