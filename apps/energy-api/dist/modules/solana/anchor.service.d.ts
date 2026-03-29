import * as anchor from '@coral-xyz/anchor';
import { Idl } from '@coral-xyz/anchor';
import { SolanaService } from './solana.service';
export declare class AnchorService {
    private readonly solanaService;
    readonly provider: anchor.AnchorProvider;
    readonly program: anchor.Program<Idl>;
    constructor(solanaService: SolanaService);
    static create(solanaService: SolanaService): Promise<AnchorService>;
}
