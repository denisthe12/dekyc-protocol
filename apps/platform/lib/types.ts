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