import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
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

  private async buildTransferTx(
    from: PublicKey,
    to: PublicKey,
    lamports: number,
  ): Promise<Transaction> {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      }),
    );

    tx.feePayer = from;
    tx.recentBlockhash = (
      await this.getConnection().getLatestBlockhash('confirmed')
    ).blockhash;

    return tx;
  }

  public async ensureSolBalance(
    wallet: string,
    minSol = 0.02,
    topUpSol = 0.1,
  ): Promise<{
    toppedUp: boolean;
    balanceBefore: number;
    balanceAfter?: number;
    tx?: string;
  }> {
    const connection = this.getConnection();
    const signer = await this.getSigner();

    const pubkey = new PublicKey(wallet);

    const balanceLamports = await connection.getBalance(pubkey, 'confirmed');
    const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

    if (balanceSol >= minSol) {
      return {
        toppedUp: false,
        balanceBefore: balanceSol,
        balanceAfter: balanceSol,
      };
    }

    const lamports = Math.floor(topUpSol * LAMPORTS_PER_SOL);

    const signature = await sendAndConfirmTransaction(
      connection,
      await this.buildTransferTx(signer.publicKey, pubkey, lamports),
      [signer],
      {
        commitment: 'confirmed',
        skipPreflight: false,
      },
    );

    const targetLamports = Math.floor(minSol * LAMPORTS_PER_SOL);

    let newBalanceLamports = 0;
    let attempts = 0;

    while (attempts < 10) {
      newBalanceLamports = await connection.getBalance(pubkey, 'confirmed');

      if (newBalanceLamports >= targetLamports) {
        return {
          toppedUp: true,
          balanceBefore: balanceSol,
          balanceAfter: newBalanceLamports / LAMPORTS_PER_SOL,
          tx: signature,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 700));
      attempts += 1;
    }

    throw new Error(
      `SOL top-up transaction confirmed but balance is still below minimum. tx=${signature}`,
    );
  }
}