import { EnergySession } from './types/dekyc';

const SESSION_KEY = 'energy-session';

export function saveEnergySession(session: EnergySession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadEnergySession(): EnergySession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EnergySession;
  } catch {
    return null;
  }
}

export function clearEnergySession(): void {
  localStorage.removeItem(SESSION_KEY);
}