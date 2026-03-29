import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
export declare class SolanaController {
    private readonly solanaService;
    private readonly token2022Service;
    constructor(solanaService: SolanaService, token2022Service: Token2022Service);
    getStatus(): Promise<{
        rpcUrl: string;
        signerAddress: string;
        signerBalanceSol: number;
        kzte: import("./solana.types").KzteMintStatus;
        tokenizationProgramId: string;
    }>;
    createKzteMint(): Promise<{
        mintAddress: string;
        decimals: number;
        tokenProgram: string;
    }>;
}
