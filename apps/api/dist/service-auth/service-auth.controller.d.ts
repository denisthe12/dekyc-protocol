import { Request } from 'express';
import { ServiceLoginDto } from './dto/service-login.dto';
import { ServiceAuthService } from './service-auth.service';
export declare class ServiceAuthController {
    private readonly serviceAuthService;
    constructor(serviceAuthService: ServiceAuthService);
    login(body: ServiceLoginDto, req: Request & {
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
