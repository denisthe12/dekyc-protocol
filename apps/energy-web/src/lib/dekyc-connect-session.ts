export type PendingDekycConnectSession = {
  state: string;
  nonce: string;
  redirectUri: string;
  createdAt: number;
};

const STORAGE_KEY = 'energy-dekyc-connect-pending-session';
const TTL_MS = 10 * 60 * 1000;

export function savePendingDekycConnectSession(
  session: PendingDekycConnectSession,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadPendingDekycConnectSession():
  | PendingDekycConnectSession
  | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingDekycConnectSession;
  } catch {
    return null;
  }
}

export function clearPendingDekycConnectSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function isPendingDekycConnectSessionFresh(
  session: PendingDekycConnectSession,
): boolean {
  return Date.now() - session.createdAt <= TTL_MS;
}