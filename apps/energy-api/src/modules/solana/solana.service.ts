import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private connection: Connection | null = null;
  private signer: Keypair | null = null;

  public getConnection(): Connection {
    if (this.connection) {
      return this.connection;
    }

    const rpcUrl = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    return this.connection;
  }

  public async getSigner(): Promise<Keypair> {
    if (this.signer) {
      return this.signer;
    }

    const keypairPath = process.env.SOLANA_SIGNER_KEYPAIR_PATH;
    if (!keypairPath) {
      throw new Error('SOLANA_SIGNER_KEYPAIR_PATH is not configured');
    }

    const resolvedPath = path.resolve(process.cwd(), keypairPath);
    const raw = await fs.readFile(resolvedPath, 'utf-8');
    const secret = JSON.parse(raw) as number[];

    if (!Array.isArray(secret) || secret.length === 0) {
      throw new Error('Invalid signer keypair file');
    }

    this.signer = Keypair.fromSecretKey(Uint8Array.from(secret));
    return this.signer;
  }

  public getProgramId(): PublicKey {
    const value = process.env.TOKENIZATION_PROGRAM_ID?.trim();
    if (!value) {
      throw new Error('TOKENIZATION_PROGRAM_ID is not configured');
    }

    return new PublicKey(value);
  }

  public getKzteMint(): PublicKey {
    const value = process.env.KZTE_MINT_ADDRESS?.trim();
    if (!value) {
      throw new Error('KZTE_MINT_ADDRESS is not configured');
    }

    return new PublicKey(value);
  }

  public async getSignerStatus(): Promise<{
    rpcUrl: string;
    signerAddress: string;
    signerBalanceSol: number;
  }> {
    const connection = this.getConnection();
    const signer = await this.getSigner();
    const balanceLamports = await connection.getBalance(signer.publicKey, 'confirmed');

    return {
      rpcUrl: connection.rpcEndpoint,
      signerAddress: signer.publicKey.toBase58(),
      signerBalanceSol: balanceLamports / LAMPORTS_PER_SOL,
    };
  }
}