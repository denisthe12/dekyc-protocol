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