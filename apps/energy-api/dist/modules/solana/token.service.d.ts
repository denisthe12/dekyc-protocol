import { PublicKey } from '@solana/web3.js';
import { SolanaService } from './solana.service';
export declare class TokenService {
    private readonly solanaService;
    constructor(solanaService: SolanaService);
    createShareMint(authority: PublicKey): Promise<PublicKey>;
    createTreasuryAccount(params: {
        mint: PublicKey;
        owner: PublicKey;
    }): Promise<import("@solana/spl-token").Account>;
}
