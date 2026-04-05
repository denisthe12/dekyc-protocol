import type { Request } from 'express';
import { AssetAccessService } from './asset-access.service';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};
export declare class AssetAccessController {
    private readonly assetAccessService;
    constructor(assetAccessService: AssetAccessService);
    getAccess(assetId: string, req: AuthenticatedRequest): Promise<{
        assetId: string;
        energyUserId: string;
        hasAccess: boolean;
        status: import("prisma/generated/client").$Enums.EnergyAssetAccessStatus | null;
    }>;
    requestAccess(assetId: string, req: AuthenticatedRequest): Promise<{
        assetId: string;
        energyUserId: string;
        hasAccess: boolean;
        status: import("prisma/generated/client").$Enums.EnergyAssetAccessStatus;
    }>;
}
export {};
