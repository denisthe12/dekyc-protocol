import { KzteMintStatus } from './solana.types';
import { SolanaService } from './solana.service';
export declare class Token2022Service {
    private readonly solanaService;
    constructor(solanaService: SolanaService);
    getKzteMintStatus(): Promise<KzteMintStatus>;
    createKzteMint(): Promise<{
        mintAddress: string;
        decimals: number;
        tokenProgram: string;
    }>;
    mintKzteToSigner(params?: {
        amountKzte?: number;
    }): Promise<{
        signerAddress: string;
        signerKzteAccount: string;
        amountKzte: number;
        amountBaseUnits: string;
        tx: string;
    }>;
}
