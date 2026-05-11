import { EnergySession } from './types/dekyc';

const SESSION_KEY = 'energy-session';

type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isEnergySessionExpired(session: EnergySession): boolean {
  if (!isBrowser()) {
    return true;
  }

  const payload = decodeJwtPayload(session.accessToken);

  if (!payload?.exp) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  return payload.exp <= nowInSeconds;
}

export function saveEnergySession(session: EnergySession): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadEnergySession(): EnergySession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as EnergySession;

    if (isEnergySessionExpired(session)) {
      clearEnergySession();
      return null;
    }

    return session;
  } catch {
    clearEnergySession();
    return null;
  }
}

export function clearEnergySession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}