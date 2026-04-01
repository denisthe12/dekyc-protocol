import { PublicKey } from '@solana/web3.js';
import { SolanaService } from './solana.service';
export declare class EnergyPointsService {
    private readonly solanaService;
    constructor(solanaService: SolanaService);
    getEnergyPointsMintStatus(): Promise<{
        exists: boolean;
        mintAddress: string | null;
        decimals: number | null;
        supply: string | null;
        tokenProgram: string;
    }>;
    createEnergyPointsMint(): Promise<{
        mintAddress: string;
        decimals: number;
        tokenProgram: string;
    }>;
    ensureUserEnergyPointsAccount(userWalletAddress: string): Promise<{
        tokenAccountAddress: string;
    }>;
    mintEnergyPointsToUser(params: {
        recipientTokenAccount: string;
        amountBaseUnits: bigint;
    }): Promise<{
        tx: string;
    }>;
    getEnergyPointsMint(): PublicKey;
}
