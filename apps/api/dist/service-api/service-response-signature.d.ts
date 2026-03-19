export declare function canonicalizeSignedEnvelope(input: {
    payload: unknown;
    timestamp: number;
    nonce: string;
}): string;
export declare function signServiceResponse(input: {
    responseSigningSecret: string;
    payload: unknown;
    timestamp: number;
    nonce: string;
}): {
    canonical: string;
    signature: string;
};
