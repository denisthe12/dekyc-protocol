import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';
export declare class WalletsService {
    private readonly prisma;
    private readonly solanaService;
    constructor(prisma: PrismaService, solanaService: SolanaService);
    ensureUserWallet(params: {
        energyUserId: string;
    }): Promise<void>;
}
