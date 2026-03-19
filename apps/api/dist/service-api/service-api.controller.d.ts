import { ServiceApiService } from './service-api.service';
import { ServiceKycRequestDto } from './dto/service-kyc-request.dto';
import { Request } from 'express';
import type { TokenCheck } from './service-api.service';
export declare class ServiceApiController {
    private readonly serviceApiService;
    constructor(serviceApiService: ServiceApiService);
    requestKyc(body: ServiceKycRequestDto, req: Request & {
        serviceAuth: {
            serviceId: string;
            clientId: string;
            serviceName: string;
        };
    }): Promise<{
        allowed: boolean;
        reason: string;
        claims: null;
        grantedClaims?: undefined;
        grantedScopes?: undefined;
        tokenChecks?: undefined;
        scopeGrantRefs?: undefined;
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: null;
        grantedClaims: never[];
        grantedScopes: never[];
        tokenChecks: TokenCheck[];
        scopeGrantRefs?: undefined;
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown>;
        grantedClaims: string[];
        grantedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        tokenChecks: TokenCheck[];
        scopeGrantRefs: {
            scope: string;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            requiredAmount: number;
            balanceCheckMode: string;
        }[];
        policy: {
            allowedClaims: string[];
            requestedClaims: string[];
            allowedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
            requestedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        };
    }>;
}
