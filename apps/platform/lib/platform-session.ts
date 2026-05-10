export const PLATFORM_ACCESS_TOKEN_KEY = 'dekyc_access_token';

type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  [key: string]: unknown;
};

function safeBase64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );

  return atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadPart] = token.split('.');

    if (!payloadPart) {
      return null;
    }

    const json = safeBase64UrlDecode(payloadPart);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  return payload.exp <= nowInSeconds;
}

export function getPlatformAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem(PLATFORM_ACCESS_TOKEN_KEY);

  if (!token) {
    return null;
  }

  if (isJwtExpired(token)) {
    clearPlatformSession();
    return null;
  }

  return token;
}

export function setPlatformSession(accessToken: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLATFORM_ACCESS_TOKEN_KEY, accessToken);
}

export function clearPlatformSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PLATFORM_ACCESS_TOKEN_KEY);

  window.localStorage.removeItem('dekyc_user');
  window.localStorage.removeItem('dekyc_service_session');
}

export function hasPlatformSession(): boolean {
  return getPlatformAccessToken() !== null;
}