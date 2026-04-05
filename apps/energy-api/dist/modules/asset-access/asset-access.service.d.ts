import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class AssetAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAccess(params: {
        energyUserId: string;
        assetId: string;
    }): Promise<{
        assetId: string;
        energyUserId: string;
        hasAccess: boolean;
        status: import("prisma/generated/client").$Enums.EnergyAssetAccessStatus | null;
    }>;
    requestAccess(params: {
        energyUserId: string;
        assetId: string;
    }): Promise<{
        assetId: string;
        energyUserId: string;
        hasAccess: boolean;
        status: import("prisma/generated/client").$Enums.EnergyAssetAccessStatus;
    }>;
}
