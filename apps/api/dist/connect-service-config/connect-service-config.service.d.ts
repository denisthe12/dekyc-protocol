import { PrismaService } from '../prisma/prisma.service';
import type { UpdateConnectServiceConfigDto } from './dto/update-connect-service-config.dto';
export declare class ConnectServiceConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getConfig(serviceId: string): Promise<{
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
    updateConfig(input: {
        serviceId: string;
        dto: UpdateConnectServiceConfigDto;
    }): Promise<{
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
    private findServiceOrThrow;
    private normalizeRedirectUris;
    private normalizeRedirectUri;
    private normalizeAllowedScopes;
    private normalizeWebhookSigningMode;
    private normalizeEnvironment;
    private normalizeRequiredString;
    private normalizeOptionalString;
    private toConfigDto;
    private readStringArray;
}
