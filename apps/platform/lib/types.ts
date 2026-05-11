export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionItem = {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  version: number;
  requiredTokenAmount: number | null;
  onchainPermissionPda: string | null;
  permissionKeyHash: string | null;
  kycHashSnapshot: string | null;
  allowedClaims: string[] | null;
  scopesHash: string | null;
  mintAddress: string | null;
  tokenAccountAddress: string | null;
  tokenProgram: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
  service: {
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    status: string;
  };
};

export type GrantPermissionResponse = {
  permission: PermissionItem;
  scopeGrants: Array<{
    scope: string;
    requiredAmount: number;
    mintAddress: string;
    tokenAccountAddress: string;
    tokenProgram: string;
    initTx: string | null;
    mintTx: string;
  }>;
  derived: {
    permissionKey: string;
    permissionKeyHash: string;
  };
  onChain: {
    userPda: string;
    grantTx: string;
    permissionPda: string;
  };
};

export type ProtocolScopeGrant = {
  id: string;
  permissionId: string;
  serviceId: string;
  scope: string;
  requiredAmount: number;
  mintAddress: string | null;
  tokenAccountAddress: string | null;
  tokenProgram: string | null;
  balanceCheckMode: string;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
};

export type ProtocolPermission = PermissionItem & {
  scopeGrants: ProtocolScopeGrant[];
};

export type ProtocolAccessLog = {
  id: string;
  permissionId: string;
  serviceId: string;
  decision: string;
  reason: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    clientId: string;
  };
  permission: {
    id: string;
    status: string;
    onchainPermissionPda: string | null;
  };
};

export type ProtocolSnapshot = {
  permissions: ProtocolPermission[];
  accessLogs: ProtocolAccessLog[];
};

export type ProfileSummaryResponse = {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profileStatus: {
    biometricConfigured: boolean;
    biometricMockId: string | null;
    loginCodeConfigured: boolean;
    loginCodeIssuedAt: string | null;
    edsBound: boolean;
    kycReady: boolean;
    vaultReady: boolean;
  };
  latestUserCert: {
    id: string;
    createdAt: string;
  } | null;
  latestKycProfile: {
    id: string;
    fullName: string | null;
    iin: string | null;
    birthDate: string | null;
    gender: string | null;
    country: string | null;
    email: string | null;
    status: string;
    createdAt: string;
  } | null;
  latestVaultEntry: {
    id: string;
    algorithm: string;
    keyVersion: string;
    createdAt: string;
  } | null;
};

export type KycSummaryResponse = {
  gating: {
    biometricConfigured: boolean;
    canBindEds: boolean;
  };
  eds: {
    connected: boolean;
    latestUserCert: {
      id: string;
      createdAt: string;
    } | null;
  };
  kyc: {
    ready: boolean;
    profile: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      middleName: string | null;
      fullName: string | null;
      iin: string | null;
      email: string | null;
      birthDate: string | null;
      gender: string | null;
      country: string | null;
      status: string;
      createdAt: string;
    } | null;
  };
  vault: {
    ready: boolean;
    entry: {
      id: string;
      algorithm: string;
      keyVersion: string;
      createdAt: string;
    } | null;
  };
};

export type UserFacingServiceCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  requiredClaims: string[] | null;
  optionalClaims: string[] | null;
  status: string;
};

export type UserFacingPermissionItem = {
  id: string;
  status: string;
  createdAt: string;
  revokedAt: string | null;
  allowedClaims: string[] | null;
  requiredTokenAmount: number | null;
  service: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    requiredClaims: string[] | null;
    optionalClaims: string[] | null;
    status: string;
  };
};

export type UserOverviewResponse = {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
  };
  onboarding: {
    completedSteps: number;
    totalSteps: number;
    readyForServiceLogin: boolean;
  };
  status: {
    biometricConfigured: boolean;
    biometricMockId: string | null;
    loginCodeConfigured: boolean;
    loginCodeIssuedAt: string | null;
    edsBound: boolean;
    kycReady: boolean;
    vaultReady: boolean;
    activePermissionsCount: number;
  };
  latestKycProfile: {
    id: string;
    fullName: string | null;
    iin: string | null;
    createdAt: string;
  } | null;
  latestUserCert: {
    id: string;
    createdAt: string;
  } | null;
  latestVaultEntry: {
    id: string;
    algorithm: string;
    createdAt: string;
  } | null;
};

export type DeKycConnectClaimKey =
  | 'fullName'
  | 'iin'
  | 'birthDate'
  | 'email'
  | 'verified'
  | 'age18Plus';

export interface ConnectAuthorizationSessionDetail {
  sessionId: string;
  status: string;
  service: {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    category: string | null;
  };
  requestedClaims: DeKycConnectClaimKey[];
  redirectUri: string;
  state: string | null;
  nonce: string | null;
  expiresAt: string;
  existingPermission: {
    id: string;
    status: string;
    allowedClaims: string[];
  } | null;
}

export interface ConnectAuthorizationDecision {
  sessionId: string;
  status: 'approved' | 'rejected';
  redirectUri: string;
  redirectUriWithCode?: string;
  redirectUriWithError?: string;
  consentId?: string;
  serviceSubjectId?: string;
}

export type ConnectVerificationSnapshot = {
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
};

export type VerifyAssertionResponse = {
  valid: boolean;
  reason: string | null;
  payload: Record<string, unknown> | null;
};