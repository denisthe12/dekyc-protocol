import { Injectable } from '@nestjs/common';
import {
  createInitializeMint2Instruction,
  createMintToInstruction,
  createBurnInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { createHash } from 'crypto';
import { SolanaService } from './solana.service';

@Injectable()
export class Token2022Service {
  constructor(private readonly solanaService: SolanaService) {}

  private get connection(): Connection {
    return this.solanaService.getConnection();
  }

  private get payer(): Keypair {
    return this.solanaService.getWalletKeypair();
  }

  deriveDeterministicScopeMint(serviceId: string, scope: string): Keypair {
    const seed = createHash('sha256')
      .update(`scope-mint:${serviceId}:${scope}`)
      .digest();

    return Keypair.fromSeed(seed.subarray(0, 32));
  }

  deriveServiceScopeTokenAccount(serviceOwner: PublicKey, mint: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(
      mint,
      serviceOwner,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
  }

  async createScopeMintAndAccount(params: {
    serviceId: string;
    scope: string;
    serviceOwner: PublicKey;
    decimals?: number;
  }) {
    const decimals = params.decimals ?? 0;
    const mintKeypair = this.deriveDeterministicScopeMint(
      params.serviceId,
      params.scope,
    );

    const mintPubkey = mintKeypair.publicKey;

    const mintInfo = await this.connection.getAccountInfo(mintPubkey);
    let initTx: string | null = null;

    if (!mintInfo) {
      const lamports = await this.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE,
      );

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.payer.publicKey,
          newAccountPubkey: mintPubkey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintPubkey,
          decimals,
          this.payer.publicKey,
          this.payer.publicKey,
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      initTx = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.payer, mintKeypair],
        { commitment: 'confirmed' },
      );
    }

    const ata = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.payer,
      mintPubkey,
      params.serviceOwner,
      false,
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    return {
      mint: mintPubkey.toBase58(),
      tokenAccount: ata.address.toBase58(),
      initTx,
      tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
    };
  }

  async mintScopeTokens(params: {
    mint: string;
    tokenAccount: string;
    amount: number;
  }) {
    const mint = new PublicKey(params.mint);
    const tokenAccount = new PublicKey(params.tokenAccount);

    const tx = new Transaction().add(
      createMintToInstruction(
        mint,
        tokenAccount,
        this.payer.publicKey,
        BigInt(params.amount),
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.payer],
      { commitment: 'confirmed' },
    );

    return { tx: signature };
  }

  async burnScopeTokens(params: {
    mint: string;
    tokenAccount: string;
    amount: number;
  }) {
    const mint = new PublicKey(params.mint);
    const tokenAccount = new PublicKey(params.tokenAccount);

    const tx = new Transaction().add(
      createBurnInstruction(
        tokenAccount,
        mint,
        this.payer.publicKey,
        BigInt(params.amount),
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.payer],
      { commitment: 'confirmed' },
    );

    return { tx: signature };
  }

  async getScopeTokenBalance(tokenAccountAddress: string) {
    const tokenAccount = new PublicKey(tokenAccountAddress);

    const accountInfo = await this.connection.getAccountInfo(
      tokenAccount,
      'confirmed',
    );

    if (!accountInfo) {
      throw new Error(`Token account not found: ${tokenAccountAddress}`);
    }

    const balance = await this.connection.getTokenAccountBalance(
      tokenAccount,
      'confirmed',
    );

    return Number(balance.value.amount);
  }
}