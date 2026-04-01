import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import { SolanaService } from './solana.service';
import { DEFAULT_ENERGY_POINTS_DECIMALS } from './solana.constants';

@Injectable()
export class EnergyPointsService {
  public constructor(private readonly solanaService: SolanaService) {}

  public async getEnergyPointsMintStatus(): Promise<{
    exists: boolean;
    mintAddress: string | null;
    decimals: number | null;
    supply: string | null;
    tokenProgram: string;
  }> {
    const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';

    if (!mintAddress) {
      return {
        exists: false,
        mintAddress: null,
        decimals: null,
        supply: null,
        tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
      };
    }

    const connection = this.solanaService.getConnection();
    const mint = await getMint(
      connection,
      new PublicKey(mintAddress),
      'confirmed',
      TOKEN_2022_PROGRAM_ID,
    );

    return {
      exists: true,
      mintAddress,
      decimals: mint.decimals,
      supply: mint.supply.toString(),
      tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
    };
  }

  public async createEnergyPointsMint(): Promise<{
    mintAddress: string;
    decimals: number;
    tokenProgram: string;
  }> {
    const existingMintAddress =
      process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';

    if (existingMintAddress) {
      return {
        mintAddress: existingMintAddress,
        decimals: Number(
          process.env.ENERGY_POINTS_DECIMALS ?? DEFAULT_ENERGY_POINTS_DECIMALS,
        ),
        tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
      };
    }

    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();
    const decimals = Number(
      process.env.ENERGY_POINTS_DECIMALS ?? DEFAULT_ENERGY_POINTS_DECIMALS,
    );

    const mintPublicKey = await createMint(
      connection,
      signer,
      signer.publicKey,
      signer.publicKey,
      decimals,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    return {
      mintAddress: mintPublicKey.toBase58(),
      decimals,
      tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
    };
  }

  public async ensureUserEnergyPointsAccount(userWalletAddress: string): Promise<{
    tokenAccountAddress: string;
  }> {
    const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
    if (!mintAddress) {
      throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
    }

    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();

    const owner = new PublicKey(userWalletAddress);

    console.log(
      'EnergyPoints owner on curve:',
      PublicKey.isOnCurve(owner.toBytes()),
    );
    console.log('EnergyPoints owner:', owner.toBase58());
    console.log('EnergyPoints mint:', mintAddress);

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      signer,
      new PublicKey(mintAddress),
      owner,
      true, // allowOwnerOffCurve
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    return {
      tokenAccountAddress: tokenAccount.address.toBase58(),
    };
  }

  public async mintEnergyPointsToUser(params: {
    recipientTokenAccount: string;
    amountBaseUnits: bigint;
  }): Promise<{ tx: string }> {
    const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
    if (!mintAddress) {
      throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
    }

    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();

    const tx = await mintTo(
      connection,
      signer,
      new PublicKey(mintAddress),
      new PublicKey(params.recipientTokenAccount),
      signer,
      params.amountBaseUnits,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    return { tx };
  }

  public getEnergyPointsMint(): PublicKey {
    const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
    if (!mintAddress) {
      throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
    }

    return new PublicKey(mintAddress);
  }
}