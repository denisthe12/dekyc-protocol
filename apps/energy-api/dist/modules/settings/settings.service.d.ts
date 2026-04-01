import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setActionPassword(params: {
        energyUserId: string;
        password: string;
    }): Promise<{
        id: string;
        energyUserId: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
    }>;
    verifyActionPassword(params: {
        energyUserId: string;
        password: string;
    }): Promise<{
        valid: true;
    }>;
    getActionPasswordStatus(energyUserId: string): Promise<{
        isSet: boolean;
    }>;
}
