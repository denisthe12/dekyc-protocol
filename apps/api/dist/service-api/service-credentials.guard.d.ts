import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { ServiceRequestNonceService } from './service-request-nonce.service';
export declare class ServiceCredentialsGuard implements CanActivate {
    private readonly servicesService;
    private readonly nonceService;
    constructor(servicesService: ServicesService, nonceService: ServiceRequestNonceService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private assertTimestampFresh;
}
