import {
  GrantPermissionResponse,
  PermissionItem,
  ServiceItem,
} from './types';

import { ProtocolSnapshot } from './types';

const API_BASE = 'http://localhost:3001/api';

function getToken(): string {
  if (typeof window === 'undefined') {
    throw new Error('Token is not available on the server');
  }

  const token = window.localStorage.getItem('dekyc_access_token');

  if (!token) {
    throw new Error('Access token not found. Please login in EDS Lab first.');
  }

  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status}: ${rawText}`);
  }

  return JSON.parse(rawText) as T;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  return apiFetch<ServiceItem[]>('/services/my', {
    method: 'GET',
  });
}

export async function fetchPermissions(): Promise<PermissionItem[]> {
  return apiFetch<PermissionItem[]>('/permissions/my', {
    method: 'GET',
  });
}

export async function grantPermission(input: {
  serviceId: string;
  allowedClaims: string[];
}): Promise<GrantPermissionResponse> {
  return apiFetch<GrantPermissionResponse>('/permissions/grant', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function revokePermission(permissionId: string): Promise<unknown> {
  return apiFetch('/permissions/revoke', {
    method: 'POST',
    body: JSON.stringify({ permissionId }),
  });
}

export async function fetchProtocolSnapshot(): Promise<ProtocolSnapshot> {
  return apiFetch<ProtocolSnapshot>('/protocol-monitor/snapshot', {
    method: 'GET',
  });
}