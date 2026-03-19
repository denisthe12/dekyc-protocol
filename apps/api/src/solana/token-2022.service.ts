import { Injectable } from '@nestjs/common';
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  createBurnInstruction,
  getAssociatedTokenAddressSync,
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
import { getAccount } from '@solana/spl-token';

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
    const ata = this.deriveServiceScopeTokenAccount(params.serviceOwner, mintPubkey);

    const tx = new Transaction();

    const mintInfo = await this.connection.getAccountInfo(mintPubkey);
    if (!mintInfo) {
      const lamports = await this.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE,
      );

      tx.add(
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
    }

    const ataInfo = await this.connection.getAccountInfo(ata);
    if (!ataInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          this.payer.publicKey,
          ata,
          params.serviceOwner,
          mintPubkey,
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    }

    let signature: string | null = null;

    if (tx.instructions.length > 0) {
      signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.payer, mintKeypair],
        { commitment: 'confirmed' },
      );
    }

    return {
      mint: mintPubkey.toBase58(),
      tokenAccount: ata.toBase58(),
      initTx: signature,
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

    const account = await getAccount(
      this.connection,
      tokenAccount,
      'confirmed',
      TOKEN_2022_PROGRAM_ID,
    );

    return Number(account.amount);
  }
}