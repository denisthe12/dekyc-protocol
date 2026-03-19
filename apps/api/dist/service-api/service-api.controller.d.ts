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
            nonce: string;
            timestamp: number;
        };
    }): Promise<{
        payload: unknown;
        meta: {
            timestamp: number;
            nonce: string;
        };
        signature: null;
    } | {
        payload: unknown;
        meta: {
            timestamp: number;
            nonce: string;
        };
        signature: string;
    }>;
}
