export type SignedEnvelope = {
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
    issuedAt?: string;
    expiresAt?: string;
    [key: string]: unknown;
  };
  meta: {
    timestamp: number;
    nonce: string;
  };
  signature: string | null;
  resolvedUserId: string;
};

export type EnergySession = {
  accessToken: string;
  user: {
    id: string;
    dekycUserId: string;
    email: string | null;
    fullName: string | null;
    role: string;
  };
  dekycConnect?: {
    assertionId: string;
    consentId: string;
    serviceSubjectId: string;
    consentReceiptHash: string;
    assertionExpiresAt: string;
  };
};