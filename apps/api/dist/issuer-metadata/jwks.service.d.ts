import { IdentityAssertionsSigner } from '../identity-assertions/identity-assertions.signer';
export declare class JwksService {
    private readonly signer;
    constructor(signer: IdentityAssertionsSigner);
    getJwks(): {
        keys: {
            kty: string;
            kid: string;
            alg: string;
            use: string;
            note: string;
        }[];
    };
}
