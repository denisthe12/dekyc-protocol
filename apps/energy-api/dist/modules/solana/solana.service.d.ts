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
}
