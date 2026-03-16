import { ServiceApiService } from './service-api.service';
import { ServiceKycRequestDto } from './dto/service-kyc-request.dto';
import { Request } from 'express';
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
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown>;
        grantedClaims: string[];
        policy: {
            allowedClaims: string[];
            requestedClaims: string[];
        };
    }>;
}
