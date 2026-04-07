import { ServicesService } from './services.service';
import { RegisterServiceDto } from './dto/register-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    register(body: RegisterServiceDto): Promise<{
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
    getAll(): Promise<{
        id: string;
        name: string;
        clientId: string;
        description: string | null;
        category: string | null;
        requiredClaims: import("prisma/generated/client/runtime/library").JsonValue;
        optionalClaims: import("prisma/generated/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCatalog(): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string | null;
        requiredClaims: import("prisma/generated/client/runtime/library").JsonValue;
        optionalClaims: import("prisma/generated/client/runtime/library").JsonValue;
        status: string;
    }[]>;
}
