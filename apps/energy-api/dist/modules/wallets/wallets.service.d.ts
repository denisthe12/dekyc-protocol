import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { EnergyPointsService } from '../solana/energy-points.service';
export declare class WalletsService {
    private readonly prisma;
    private readonly solanaService;
    private readonly energyPointsService;
    constructor(prisma: PrismaService, solanaService: SolanaService, energyPointsService: EnergyPointsService);
    ensureUserWallet(params: {
        energyUserId: string;
    }): Promise<void>;
}
