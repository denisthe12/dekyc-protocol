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
};
export {};
