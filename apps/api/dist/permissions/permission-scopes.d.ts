export declare const PERMISSION_SCOPES: readonly ["kyc.full_name", "kyc.email", "kyc.iin", "kyc.birth_date", "kyc.gender", "kyc.country", "kyc.verified", "kyc.age_18_plus"];
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
export declare const CLAIM_TO_SCOPE: Record<string, PermissionScope>;
export declare const SCOPE_TO_CLAIM: Record<PermissionScope, string>;
