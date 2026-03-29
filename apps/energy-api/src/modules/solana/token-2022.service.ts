import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  getMint,
} from '@solana/spl-token';
import {
  DEFAULT_KZTE_DECIMALS,
} from './solana.constants';
import { KzteMintStatus } from './solana.types';
import { SolanaService } from './solana.service';

@Injectable()
export class Token2022Service {
  public constructor(private readonly solanaService: SolanaService) {}

  public async getKzteMintStatus(): Promise<KzteMintStatus> {
    const mintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
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

  public async createKzteMint(): Promise<{
    mintAddress: string;
    decimals: number;
    tokenProgram: string;
  }> {
    const existingMintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
    if (existingMintAddress) {
      return {
        mintAddress: existingMintAddress,
        decimals: Number(process.env.KZTE_DECIMALS ?? DEFAULT_KZTE_DECIMALS),
        tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
      };
    }

    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();
    const decimals = Number(process.env.KZTE_DECIMALS ?? DEFAULT_KZTE_DECIMALS);

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
}