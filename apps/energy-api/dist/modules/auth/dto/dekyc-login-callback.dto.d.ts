declare class TokenCheckDto {
    scope: string;
    ok: boolean;
    reason: string;
    readError: string | null;
    tokenAccountAddress: string | null;
    mintAddress: string | null;
    balance: number;
    requiredAmount: number;
}
declare class ScopeGrantRefDto {
    scope: string;
    mintAddress: string | null;
    tokenAccountAddress: string | null;
    requiredAmount: number;
    balanceCheckMode?: string;
}
declare class PolicyDto {
    allowedClaims?: string[];
    requestedClaims?: string[];
    allowedScopes?: string[];
    requestedScopes?: string[];
}
declare class EnvelopePayloadDto {
    allowed: boolean;
    reason: string;
    claims?: Record<string, unknown> | null;
    grantedClaims?: string[];
    grantedScopes?: string[];
    tokenChecks?: TokenCheckDto[];
    scopeGrantRefs?: ScopeGrantRefDto[];
    policy?: PolicyDto;
}
declare class EnvelopeMetaDto {
    timestamp: number;
    nonce: string;
}
declare class SignedEnvelopeDto {
    payload: EnvelopePayloadDto;
    meta: EnvelopeMetaDto;
    signature: string | null;
    resolvedUserId: string;
}
export declare class DekycLoginCallbackDto {
    envelope: SignedEnvelopeDto;
}
export {};
