type KycProfileLike = {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    iin: string | null;
    email: string | null;
    birthDate: string | null;
    gender: string | null;
    country: string | null;
};
export declare function buildScopedClaims(params: {
    profile: KycProfileLike;
    allowedClaims: string[];
    requestedClaims?: string[];
}): {
    claims: Record<string, unknown>;
    grantedClaims: string[];
    grantedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
    allowedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
    requestedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
};
export {};
