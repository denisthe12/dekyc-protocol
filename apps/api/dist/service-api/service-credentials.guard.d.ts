import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
export declare class ServiceCredentialsGuard implements CanActivate {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
