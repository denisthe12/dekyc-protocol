import { web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
export declare class SolanaService {
    private readonly connection;
    private readonly walletKeypair;
    private readonly provider;
    private readonly programId;
    private readonly program;
    constructor();
    getConnection(): web3.Connection;
    getProgramId(): web3.PublicKey;
    getWalletPubkey(): web3.PublicKey;
    getWalletKeypair(): web3.Keypair;
    deriveUserPda(authority: PublicKey): [web3.PublicKey, number];
    derivePermissionPda(userPda: PublicKey, serviceIdHash: Uint8Array): [web3.PublicKey, number];
    hashTo32Bytes(value: string): Uint8Array;
    registerUserOnChain(userId: string): Promise<{
        tx: string;
        userPda: string;
    }>;
    grantPermissionOnChain(params: {
        userId: string;
        serviceId: string;
        kycHash: string;
        scopesHash: string;
        requiredAmount: number;
        mint: string;
        tokenAccount: string;
    }): Promise<{
        tx: string;
        userPda: string;
        permissionPda: string;
        mint: string;
        tokenAccount: string;
        tokenProgram: string;
    }>;
    revokePermissionOnChain(serviceId: string): Promise<{
        tx: string;
        permissionPda: string;
    }>;
}
