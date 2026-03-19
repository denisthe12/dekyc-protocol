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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        clientId: string;
        description: string | null;
    }[]>;
}
