import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { DekycConnectTokenResponse } from '@/modules/auth/types/dekyc-connect-token-response.type';

type DekycSignedEnvelope = {
  payload: {
    allowed: boolean;
    reason: string;
    claims: Record<string, unknown> | null;
    grantedClaims?: string[];
    grantedScopes?: string[];
    tokenChecks?: Array<{
      scope: string;
      ok: boolean;
      reason: string;
      readError: string | null;
      tokenAccountAddress: string | null;
      mintAddress: string | null;
      balance: number;
      requiredAmount: number;
    }>;
    scopeGrantRefs?: Array<{
      scope: string;
      mintAddress: string | null;
      tokenAccountAddress: string | null;
      requiredAmount: number;
      balanceCheckMode?: string;
    }>;
    policy?: {
      allowedClaims?: string[];
      requestedClaims?: string[];
      allowedScopes?: string[];
      requestedScopes?: string[];
    };
  };
  meta: {
    timestamp: number;
    nonce: string;
  };
  signature: string | null;
  resolvedUserId: string;
};

@Injectable()
export class DekycClientService {
  private readonly baseUrl = process.env.DEKYC_API_BASE_URL ?? 'http://localhost:3001/api';
  private readonly serviceId = process.env.DEKYC_SERVICE_ID ?? '';
  private readonly clientId = process.env.DEKYC_CLIENT_ID ?? '';
  private readonly clientSecret = process.env.DEKYC_CLIENT_SECRET ?? '';

  public async login(params: {
    biometricMockId: string;
    loginCode: string;
    requestedClaims?: string[];
  }): Promise<DekycSignedEnvelope> {
    if (!this.serviceId || !this.clientId || !this.clientSecret) {
      throw new UnauthorizedException('DeKYC service credentials are not configured');
    }

    const timestamp = Date.now();
    const nonce = `energy-api-login-${timestamp}`;

    const response = await fetch(`${this.baseUrl}/service-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-client-secret': this.clientSecret,
        'x-timestamp': String(timestamp),
        'x-nonce': nonce,
      },
      body: JSON.stringify({
        biometricMockId: params.biometricMockId,
        loginCode: params.loginCode,
        requestedClaims: params.requestedClaims,
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new UnauthorizedException(
        `DeKYC login failed: ${response.status} ${rawText}`,
      );
    }

    return JSON.parse(rawText) as DekycSignedEnvelope;
  }

  public async exchangeConnectCode(params: {
    code: string;
    redirectUri: string;
  }): Promise<DekycConnectTokenResponse> {
    if (!this.serviceId || !this.clientId || !this.clientSecret) {
      throw new UnauthorizedException('DeKYC service credentials are not configured');
    }

    const timestamp = Date.now();
    const nonce = `energy-api-connect-token-${timestamp}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const response = await fetch(`${this.baseUrl}/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-client-secret': this.clientSecret,
        'x-timestamp': String(timestamp),
        'x-nonce': nonce,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: this.clientId,
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new UnauthorizedException(
        `DeKYC Connect token exchange failed: ${response.status} ${rawText}`,
      );
    }

    return JSON.parse(rawText) as DekycConnectTokenResponse;
  }
}