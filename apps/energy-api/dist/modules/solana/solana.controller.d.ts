import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
import { EnergyPointsService } from './energy-points.service';
export declare class SolanaController {
    private readonly solanaService;
    private readonly token2022Service;
    private readonly energyPointsService;
    constructor(solanaService: SolanaService, token2022Service: Token2022Service, energyPointsService: EnergyPointsService);
    getStatus(): Promise<{
        rpcUrl: string;
        signerAddress: string;
        signerBalanceSol: number;
        kzte: import("./solana.types").KzteMintStatus;
        tokenizationProgramId: string;
        energyPoints: {
            exists: boolean;
            mintAddress: string | null;
            decimals: number | null;
            supply: string | null;
            tokenProgram: string;
        };
    }>;
    createKzteMint(): Promise<{
        mintAddress: string;
        decimals: number;
        tokenProgram: string;
    }>;
    mintKzteToSigner(body?: {
        amountKzte?: number;
    }): Promise<{
        signerAddress: string;
        signerKzteAccount: string;
        amountKzte: number;
        amountBaseUnits: string;
        tx: string;
    }>;
    createEnergyPointsMint(): Promise<{
        mintAddress: string;
        decimals: number;
        tokenProgram: string;
    }>;
}
