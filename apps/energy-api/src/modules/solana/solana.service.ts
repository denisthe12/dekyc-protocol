import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { DEFAULT_SOLANA_RPC_URL } from './solana.constants';
import { SolanaSignerStatus } from './solana.types';

@Injectable()
export class SolanaService {
  private connection: Connection | null = null;
  private signer: Keypair | null = null;

  public getConnection(): Connection {
    if (this.connection) {
      return this.connection;
    }

    const rpcUrl = process.env.SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
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

  public async getSignerPublicKey(): Promise<PublicKey> {
    const signer = await this.getSigner();
    return signer.publicKey;
  }

  public async getSignerStatus(): Promise<SolanaSignerStatus> {
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