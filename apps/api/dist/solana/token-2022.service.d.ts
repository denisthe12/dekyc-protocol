import { Keypair, PublicKey } from '@solana/web3.js';
import { SolanaService } from './solana.service';
export declare class Token2022Service {
    private readonly solanaService;
    constructor(solanaService: SolanaService);
    private get connection();
    private get payer();
    deriveDeterministicScopeMint(serviceId: string, scope: string): Keypair;
    deriveServiceScopeTokenAccount(serviceOwner: PublicKey, mint: PublicKey): PublicKey;
    createScopeMintAndAccount(params: {
        serviceId: string;
        scope: string;
        serviceOwner: PublicKey;
        decimals?: number;
    }): Promise<{
        mint: string;
        tokenAccount: string;
        initTx: string | null;
        tokenProgram: string;
    }>;
    mintScopeTokens(params: {
        mint: string;
        tokenAccount: string;
        amount: number;
    }): Promise<{
        tx: string;
    }>;
    burnScopeTokens(params: {
        mint: string;
        tokenAccount: string;
        amount: number;
    }): Promise<{
        tx: string;
    }>;
}
