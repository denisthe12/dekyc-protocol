import { Injectable } from '@nestjs/common';
import { AnchorProvider, BN, Program, Wallet, web3, Idl } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { getRequiredEnv } from '../config/env';
import { existsSync } from 'fs';

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
    const keypairPath = getRequiredEnv('SOLANA_KEYPAIR_PATH');
    const programId = getRequiredEnv('SOLANA_PERMISSION_PROGRAM_ID');

    this.connection = new Connection(rpcUrl, 'confirmed');

    const secret = JSON.parse(readFileSync(keypairPath, 'utf8')) as number[];
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
    requiredAmount: number;
  }) {
    if (!this.program) {
      throw new Error('Program IDL is not loaded');
    }

    const authority = this.walletKeypair.publicKey;
    const [userPda] = this.deriveUserPda(authority);

    const serviceIdHash = this.hashTo32Bytes(params.serviceId);
    const kycHash32 = this.hashTo32Bytes(params.kycHash);
    const [permissionPda] = this.derivePermissionPda(userPda, serviceIdHash);

    const tx = await this.program.methods
      .grantPermission(
        Array.from(serviceIdHash),
        Array.from(kycHash32),
        new BN(params.requiredAmount),
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