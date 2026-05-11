import type {
  ConnectAuthorizationDecision,
  ConnectAuthorizationSessionDetail,
  DeKycConnectClaimKey,
  GrantPermissionResponse,
  KycSummaryResponse,
  PermissionItem,
  ProfileSummaryResponse,
  ProtocolSnapshot,
  ServiceItem,
  UserFacingPermissionItem,
  UserFacingServiceCatalogItem,
  UserOverviewResponse,
  ConnectVerificationSnapshot,
  VerifyAssertionResponse,
} from './types';

import {
  clearPlatformSession,
  getPlatformAccessToken,
} from './platform-session';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

function getCurrentLocaleFromPath(): 'ru' | 'en' {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  return window.location.pathname.startsWith('/en') ? 'en' : 'ru';
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const locale = getCurrentLocaleFromPath();
  window.location.replace(`/${locale}/login`);
}

function getTokenOrRedirect(): string {
  if (typeof window === 'undefined') {
    throw new Error('Token is not available on the server');
  }

  const token = getPlatformAccessToken();

  if (!token) {
    clearPlatformSession();
    redirectToLogin();

    throw new Error('Session expired. Please login to DeKYC Platform again.');
  }

  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getTokenOrRedirect();

  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const rawText = await response.text();

  if (response.status === 401) {
    clearPlatformSession();
    redirectToLogin();

    throw new Error('Session expired. Please login to DeKYC Platform again.');
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${rawText}`);
  }

  if (!rawText) {
    return undefined as T;
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

export async function fetchProfileSummary(): Promise<ProfileSummaryResponse> {
  return apiFetch<ProfileSummaryResponse>('/auth/profile-summary', {
    method: 'GET',
  });
}

export async function setupBiometric(input: {
  biometricMockId: string;
}): Promise<{
  id: string;
  biometricConfigured: boolean;
  biometricMockId: string | null;
  updatedAt: string;
}> {
  return apiFetch('/auth/biometric/setup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function issueLoginCode(): Promise<{
  loginCode: string;
  issuedAt: string;
}> {
  return apiFetch('/auth/login-code/issue', {
    method: 'POST',
  });
}

export async function rotateLoginCode(): Promise<{
  loginCode: string;
  issuedAt: string;
}> {
  return apiFetch('/auth/login-code/rotate', {
    method: 'POST',
  });
}

export async function fetchKycSummary(): Promise<KycSummaryResponse> {
  return apiFetch<KycSummaryResponse>('/auth/kyc-summary', {
    method: 'GET',
  });
}

export async function fetchUserFacingServiceCatalog(): Promise<
  UserFacingServiceCatalogItem[]
> {
  return apiFetch<UserFacingServiceCatalogItem[]>('/services/catalog', {
    method: 'GET',
  });
}

export async function fetchUserFacingPermissions(): Promise<
  UserFacingPermissionItem[]
> {
  return apiFetch<UserFacingPermissionItem[]>('/permissions/user-facing', {
    method: 'GET',
  });
}

export async function fetchUserOverview(): Promise<UserOverviewResponse> {
  return apiFetch<UserOverviewResponse>('/auth/user-overview', {
    method: 'GET',
  });
}

export async function fetchConnectAuthorizationSession(
  sessionId: string,
): Promise<ConnectAuthorizationSessionDetail> {
  return apiFetch<ConnectAuthorizationSessionDetail>(
    `/connect/authorization-sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
    },
  );
}

export async function approveConnectAuthorizationSession(input: {
  sessionId: string;
  approvedClaims: DeKycConnectClaimKey[];
}): Promise<ConnectAuthorizationDecision> {
  return apiFetch<ConnectAuthorizationDecision>(
    `/connect/authorization-sessions/${encodeURIComponent(input.sessionId)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({
        approvedClaims: input.approvedClaims,
        consentTextVersion: 'dekyc-connect-consent-v1',
      }),
    },
  );
}

export async function rejectConnectAuthorizationSession(input: {
  sessionId: string;
  reason?: string;
}): Promise<ConnectAuthorizationDecision> {
  return apiFetch<ConnectAuthorizationDecision>(
    `/connect/authorization-sessions/${encodeURIComponent(input.sessionId)}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({
        reason: input.reason ?? 'User rejected consent',
      }),
    },
  );
}

export async function fetchConnectVerificationSnapshot(): Promise<ConnectVerificationSnapshot> {
  return apiFetch<ConnectVerificationSnapshot>('/connect-verification/snapshot', {
    method: 'GET',
  });
}

export async function verifyConnectAssertion(
  assertionJws: string,
): Promise<VerifyAssertionResponse> {
  return apiFetch<VerifyAssertionResponse>('/connect/assertions/verify', {
    method: 'POST',
    body: JSON.stringify({
      assertionJws,
    }),
  });
}