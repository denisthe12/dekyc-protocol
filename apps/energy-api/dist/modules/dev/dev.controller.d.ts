import { DevService } from './dev.service';
export declare class DevController {
    private readonly devService;
    constructor(devService: DevService);
    seedDemoInvestor(): Promise<{
        created: boolean;
        user: {
            profile: {
                id: string;
                energyUserId: string;
                createdAt: Date;
                updatedAt: Date;
                dekycUserId: string;
                email: string | null;
                fullName: string | null;
                iin: string | null;
                birthDate: string | null;
                verified: boolean;
                age18Plus: boolean;
                rawClaimsJson: import("prisma/generated/client/runtime/library").JsonValue | null;
            } | null;
            wallet: {
                id: string;
                energyUserId: string;
                custodialWalletAddress: string;
                kzteTokenAccountAddress: string | null;
                energyPointsAccountAddress: string | null;
                custodialWalletSecretJson: import("prisma/generated/client/runtime/library").JsonValue | null;
                energyPointsTokenAccountAddress: string | null;
                walletStatus: import("prisma/generated/client").$Enums.EnergyWalletStatus;
                initialKzteAirdropped: boolean;
                initialKzteAirdropTx: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dekycUserId: string;
            email: string | null;
            fullName: string | null;
            role: import("prisma/generated/client").$Enums.EnergyUserRole;
            lastLoginAt: Date | null;
        };
    }>;
}
