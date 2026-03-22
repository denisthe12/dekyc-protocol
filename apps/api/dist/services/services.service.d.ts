import { PrismaService } from '../prisma/prisma.service';
import { RegisterServiceDto } from './dto/register-service.dto';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerService(dto: RegisterServiceDto): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            category: string | null;
            clientId: string;
            status: string;
            createdAt: Date;
        };
        issuedCredentials: {
            clientId: string;
            clientSecret: string;
            responseSigningSecret: string;
        };
    }>;
    getAllServices(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        clientId: string;
        description: string | null;
        category: string | null;
        requiredClaims: import("@prisma/client/runtime/library").JsonValue;
        optionalClaims: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getServiceById(serviceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        clientId: string;
        description: string | null;
        category: string | null;
        requiredClaims: import("@prisma/client/runtime/library").JsonValue;
        optionalClaims: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    getServiceByClientIdWithSecrets(clientId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        clientId: string;
        clientSecretHash: string;
        responseSigningSecret: string | null;
        description: string | null;
        category: string | null;
        requiredClaims: import("@prisma/client/runtime/library").JsonValue | null;
        optionalClaims: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    validateServiceCredentials(clientId: string, clientSecret: string): Promise<{
        id: string;
        clientId: string;
        name: string;
        status: string;
    } | null>;
    getUserFacingCatalog(): Promise<{
        id: string;
        name: string;
        status: string;
        description: string | null;
        category: string | null;
        requiredClaims: import("@prisma/client/runtime/library").JsonValue;
        optionalClaims: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    private generateClientId;
    private generateClientSecret;
    private generateResponseSigningSecret;
}
