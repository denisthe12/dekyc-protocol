import { JwksService } from './jwks.service';
export declare class IssuerMetadataController {
    private readonly jwksService;
    constructor(jwksService: JwksService);
    getIssuerMetadata(): {
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        jwks_uri: string;
        assertion_verify_endpoint: string;
        supported_assertion_algorithms: string[];
        supported_response_types: string[];
        supported_grant_types: string[];
        supported_claims: string[];
        note: string;
    };
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
