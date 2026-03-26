const PLATFORM_ACCESS_TOKEN_KEY = 'dekyc_access_token';

export function clearPlatformSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PLATFORM_ACCESS_TOKEN_KEY);
}

export function hasPlatformSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(PLATFORM_ACCESS_TOKEN_KEY));
}