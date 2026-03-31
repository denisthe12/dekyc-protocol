import { Connection, Keypair, PublicKey } from '@solana/web3.js';
export declare class SolanaService {
    private connection;
    private signer;
    getConnection(): Connection;
    getSigner(): Promise<Keypair>;
    getProgramId(): PublicKey;
    getKzteMint(): PublicKey;
    getSignerStatus(): Promise<{
        rpcUrl: string;
        signerAddress: string;
        signerBalanceSol: number;
    }>;
    private buildTransferTx;
    ensureSolBalance(wallet: string, minSol?: number, topUpSol?: number): Promise<{
        toppedUp: boolean;
        balanceBefore: number;
        balanceAfter?: number;
        tx?: string;
    }>;
}
