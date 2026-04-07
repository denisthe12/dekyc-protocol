import { Injectable } from '@nestjs/common';
import { AnchorProvider, BN, Program, Wallet, web3, Idl } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { getRequiredEnv } from '../config/env';
import { existsSync } from 'fs';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

type ProgramAccountNamespace = {
  registerUser: (
    userIdHash: number[],
  ) => {
    accounts: (args: Record<string, PublicKey>) => {
      rpc: () => Promise<string>;
    };
  };
  grantPermission: (
    serviceIdHash: number[],
    kycHash: number[],
    requiredAmount: BN,
    mint: PublicKey,
    tokenAccount: PublicKey,
    tokenProgram: PublicKey,
  ) => {
    accounts: (args: Record<string, PublicKey>) => {
      rpc: () => Promise<string>;
    };
  };
  revokePermission: () => {
    accounts: (args: Record<string, PublicKey>) => {
      rpc: () => Promise<string>;
    };
  };
};

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly walletKeypair: Keypair;
  private readonly provider: AnchorProvider;
  private readonly programId: PublicKey;
  private readonly program: Program<Idl> & { methods: ProgramAccountNamespace };

  constructor() {
    const rpcUrl = getRequiredEnv('SOLANA_RPC_URL');
    const keypairPath = process.env.SOLANA_KEYPAIR_PATH?.trim() ?? '';
    const programId = getRequiredEnv('SOLANA_PERMISSION_PROGRAM_ID');
    const privateKeyFromEnv=process.env.SOLANA_PRIVATE_KEY?.trim() ?? '';

    this.connection = new Connection(rpcUrl, 'confirmed');
    let secret: number[];

    if (privateKeyFromEnv) {
      secret = JSON.parse(privateKeyFromEnv) as number[];
    } else if (keypairPath) {
      secret = JSON.parse(readFileSync(keypairPath, 'utf8')) as number[];
    } else {
      throw new Error(
        'Missing Solana signer config: set SOLANA_PRIVATE_KEY or SOLANA_KEYPAIR_PATH'
      );
    }

    this.walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secret));

    const wallet = new Wallet(this.walletKeypair);
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    this.programId = new PublicKey(programId);

    const idlPath = `${process.cwd()}/idl/permission_protocol.json`;

    if (!existsSync(idlPath)) {
      throw new Error(`IDL file not found at ${idlPath}`);
    }

    const idl = JSON.parse(readFileSync(idlPath, 'utf8')) as Idl;
    this.program = new Program(idl, this.provider) as Program<Idl> & {
      methods: ProgramAccountNamespace;
    };
  }


  getConnection() {
    return this.connection;
  }

  getProgramId() {
    return this.programId;
  }

  getWalletPubkey() {
    return this.walletKeypair.publicKey;
  }

  getWalletKeypair() {
    return this.walletKeypair;
  }

  deriveUserPda(authority: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user'), authority.toBuffer()],
      this.programId,
    );
  }

  derivePermissionPda(userPda: PublicKey, serviceIdHash: Uint8Array) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('permission'), userPda.toBuffer(), Buffer.from(serviceIdHash)],
      this.programId,
    );
  }

  hashTo32Bytes(value: string): Uint8Array {
    return createHash('sha256').update(value).digest();
  }

  async registerUserOnChain(userId: string) {
    if (!this.program) {
      throw new Error('Program IDL is not loaded');
    }

    const authority = this.walletKeypair.publicKey;
    const [userPda] = this.deriveUserPda(authority);
    const userIdHash = this.hashTo32Bytes(userId);

    const tx = await this.program.methods
      .registerUser(Array.from(userIdHash))
      .accounts({
        authority,
        userPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return {
      tx,
      userPda: userPda.toBase58(),
    };
  }

  async grantPermissionOnChain(params: {
    userId: string;
    serviceId: string;
    kycHash: string;
    scopesHash: string;
    requiredAmount: number;
    mint: string;
    tokenAccount: string;
  }) {
    if (!this.program) {
      throw new Error('Program IDL is not loaded');
    }

    const authority = this.walletKeypair.publicKey;
    const [userPda] = this.deriveUserPda(authority);

    const serviceIdHash = this.hashTo32Bytes(params.serviceId);
    const combinedHash = createHash('sha256')
      .update(`${params.kycHash}:${params.scopesHash}`)
      .digest('hex');

    const kycHash32 = this.hashTo32Bytes(combinedHash);
    const [permissionPda] = this.derivePermissionPda(userPda, serviceIdHash);

    const mintPubkey = new PublicKey(params.mint);
    const tokenAccountPubkey = new PublicKey(params.tokenAccount);

    const tx = await this.program.methods
      .grantPermission(
        Array.from(serviceIdHash),
        Array.from(kycHash32),
        new BN(params.requiredAmount),
        mintPubkey,
        tokenAccountPubkey,
        TOKEN_2022_PROGRAM_ID,
      )
      .accounts({
        authority,
        userPda,
        permissionPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return {
      tx,
      userPda: userPda.toBase58(),
      permissionPda: permissionPda.toBase58(),
      mint: mintPubkey.toBase58(),
      tokenAccount: tokenAccountPubkey.toBase58(),
      tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
    };
  }

  async revokePermissionOnChain(serviceId: string) {
    if (!this.program) {
      throw new Error('Program IDL is not loaded');
    }

    const authority = this.walletKeypair.publicKey;
    const [userPda] = this.deriveUserPda(authority);
    const serviceIdHash = this.hashTo32Bytes(serviceId);
    const [permissionPda] = this.derivePermissionPda(userPda, serviceIdHash);

    const tx = await this.program.methods
      .revokePermission()
      .accounts({
        authority,
        userPda,
        permissionPda,
      })
      .rpc();

    return {
      tx,
      permissionPda: permissionPda.toBase58(),
    };
  }
}