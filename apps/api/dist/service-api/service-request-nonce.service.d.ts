import { PrismaService } from '../prisma/prisma.service';
export declare class ServiceRequestNonceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertNonceUnusedAndStore(serviceId: string, nonce: string): Promise<void>;
}
