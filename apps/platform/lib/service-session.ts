export type ServiceSession = {
  serviceName: string;
  serviceId: string;
  clientId: string;
  userId: string;
  claims: Record<string, unknown>;
  signature: string | null;
  signedEnvelope: unknown;
  issuedAt: string;
  expiresAt: string;
};

const STORAGE_KEY = 'dekyc_service_session';

export function saveServiceSession(session: ServiceSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadServiceSession(): ServiceSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ServiceSession;

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearServiceSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}