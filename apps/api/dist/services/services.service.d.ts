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
            clientId: string;
            status: string;
            createdAt: Date;
        };
        issuedCredentials: {
            clientId: string;
            clientSecret: string;
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
    }[]>;
    getServiceById(serviceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        clientId: string;
        description: string | null;
    } | null>;
    validateServiceCredentials(clientId: string, clientSecret: string): Promise<{
        id: string;
        clientId: string;
        name: string;
        status: string;
    } | null>;
    private generateClientId;
    private generateClientSecret;
}
