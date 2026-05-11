export interface ConnectVerificationSnapshot {
  issuer: {
    issuerUrl: string;
    metadataUrl: string;
    jwksUrl: string;
    verifyEndpoint: string;
    algorithm: string;
  };
  totals: {
    authorizationSessions: number;
    pendingSessions: number;
    approvedSessions: number;
    rejectedSessions: number;
    consentReceipts: number;
    activeConsents: number;
    revokedConsents: number;
    identityAssertions: number;
    activeAssertions: number;
    expiredAssertions: number;
  };
  authorizationSessions: Array<{
    sessionId: string;
    status: string;
    clientId: string;
    serviceId: string;
    redirectUri: string;
    claimsScope: string[];
    userId: string | null;
    consentId: string | null;
    expiresAt: string;
    approvedAt: string | null;
    rejectedAt: string | null;
    completedAt: string | null;
    createdAt: string;
  }>;
  consentReceipts: Array<{
    consentId: string;
    serviceId: string;
    subjectId: string;
    serviceSubjectId: string;
    grantedClaims: string[];
    consentTextVersion: string;
    status: string;
    receiptHash: string;
    signaturePreview: string;
    grantedAt: string;
    expiresAt: string | null;
    revokedAt: string | null;
  }>;
  identityAssertions: Array<{
    assertionId: string;
    serviceId: string;
    subjectId: string;
    serviceSubjectId: string;
    consentId: string;
    algorithm: string;
    assertionJws: string;
    assertionPreview: string;
    expiresAt: string;
    revokedAt: string | null;
    createdAt: string;
  }>;
}