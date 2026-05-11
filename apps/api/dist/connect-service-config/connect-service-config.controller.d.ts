import { ConnectServiceConfigService } from './connect-service-config.service';
import { UpdateConnectServiceConfigDto } from './dto/update-connect-service-config.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
export declare class ConnectServiceConfigController {
    private readonly connectServiceConfigService;
    constructor(connectServiceConfigService: ConnectServiceConfigService);
    getServiceConfig(req: AuthenticatedServiceRequest): Promise<{
        service: {
            id: string;
            name: string;
            clientId: string;
            status: string;
        };
        connectConfig: {
            allowedRedirectUris: string[];
            allowedScopes: string[];
            assertionAudience: string | null;
            webhookSigningMode: string;
            consentTextVersion: string;
            environment: string;
        };
        updatedAt: string;
    }>;
    updateServiceConfig(body: UpdateConnectServiceConfigDto, req: AuthenticatedServiceRequest): Promise<{
        service: {
            id: string;
            name: string;
            clientId: string;
            status: string;
        };
        connectConfig: {
            allowedRedirectUris: string[];
            allowedScopes: string[];
            assertionAudience: string | null;
            webhookSigningMode: string;
            consentTextVersion: string;
            environment: string;
        };
        updatedAt: string;
    }>;
}
