import { Injectable } from '@nestjs/common';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { SolanaService } from './solana.service';

@Injectable()
export class TokenService {
  public constructor(private readonly solanaService: SolanaService) {}

  public async createShareMint(authority: PublicKey): Promise<PublicKey> {
    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();

    return createMint(
      connection,
      signer,
      authority,
      null,
      0,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
  }

  public async createTreasuryAccount(params: {
    mint: PublicKey;
    owner: PublicKey;
  }) {
    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();

    return getOrCreateAssociatedTokenAccount(
      connection,
      signer,
      params.mint,
      params.owner,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
  }
}