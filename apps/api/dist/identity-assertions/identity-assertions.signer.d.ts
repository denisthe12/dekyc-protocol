import type { DeKycIdentityAssertionPayload } from '@energy/shared';
export declare class IdentityAssertionsSigner {
    signPayload(payload: DeKycIdentityAssertionPayload): string;
    verifyAndDecode(assertionJws: string): {
        valid: boolean;
        reason: string | null;
        payload: DeKycIdentityAssertionPayload | null;
    };
    getPublicJwks(): {
        keys: {
            kty: string;
            kid: string;
            alg: string;
            use: string;
            note: string;
        }[];
    };
    private parseJws;
    private signSigningInput;
    private safeEqual;
    private isAssertionPayload;
    private getSigningSecret;
    private getKeyId;
}
