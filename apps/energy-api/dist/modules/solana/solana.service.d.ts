import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaSignerStatus } from './solana.types';
export declare class SolanaService {
    private connection;
    private signer;
    getConnection(): Connection;
    getSigner(): Promise<Keypair>;
    getSignerPublicKey(): Promise<PublicKey>;
    getSignerStatus(): Promise<SolanaSignerStatus>;
}
