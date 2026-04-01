import { Injectable } from '@nestjs/common';
import { Keypair } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { Prisma } from '../../../prisma/generated/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { EnergyPointsService } from '../solana/energy-points.service';

@Injectable()
export class WalletsService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly solanaService: SolanaService,
    private readonly energyPointsService: EnergyPointsService,
  ) {}

  public async ensureUserWallet(params: {
    energyUserId: string;
  }): Promise<void> {
    console.log('WalletsService prisma exists:', !!this.prisma);
    console.log('WalletsService solanaService exists:', !!this.solanaService);
    console.log('WalletsService energyPointsService exists:', !!this.energyPointsService);
    const existing = await this.prisma.energyUserWallet.findUnique({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    if (
      existing?.custodialWalletSecretJson &&
      existing.kzteTokenAccountAddress &&
      existing.energyPointsTokenAccountAddress
    ) {
      return;
    }

    const connection = this.solanaService.getConnection();
    const signer = await this.solanaService.getSigner();
    const mintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';

    if (!mintAddress) {
      throw new Error('KZTE_MINT_ADDRESS is not configured');
    }

    let userSecretJson: Prisma.InputJsonValue;
    let walletAddress: string;
    let userKeypair: Keypair;

    if (existing?.custodialWalletSecretJson) {
      const secretArray = existing.custodialWalletSecretJson as number[];
      userKeypair = Keypair.fromSecretKey(Uint8Array.from(secretArray));
      walletAddress = userKeypair.publicKey.toBase58();
      userSecretJson = existing.custodialWalletSecretJson as Prisma.InputJsonValue;
    } else {
      userKeypair = Keypair.generate();
      walletAddress = userKeypair.publicKey.toBase58();
      userSecretJson = Array.from(userKeypair.secretKey) as Prisma.InputJsonValue;
    }

    const kzteTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      signer,
      new (await import('@solana/web3.js')).PublicKey(mintAddress),
      userKeypair.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const energyPointsAccount =
      await this.energyPointsService.ensureUserEnergyPointsAccount(
        walletAddress,
      );

    let mintTx: string | null = existing?.initialKzteAirdropTx ?? null;

    if (!existing?.initialKzteAirdropped) {
      const oneMillionKzteBaseUnits = BigInt(1000000 * 100);

      mintTx = await mintTo(
        connection,
        signer,
        new (await import('@solana/web3.js')).PublicKey(mintAddress),
        kzteTokenAccount.address,
        signer,
        oneMillionKzteBaseUnits,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID,
      );
    }

    await getAccount(
      connection,
      kzteTokenAccount.address,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    await this.prisma.energyUserWallet.upsert({
      where: {
        energyUserId: params.energyUserId,
      },
      update: {
        custodialWalletAddress: walletAddress,
        custodialWalletSecretJson: userSecretJson,
        kzteTokenAccountAddress: kzteTokenAccount.address.toBase58(),
        energyPointsTokenAccountAddress: energyPointsAccount.tokenAccountAddress,
        walletStatus: 'ACTIVE',
        initialKzteAirdropped: true,
        initialKzteAirdropTx: mintTx,
      },
      create: {
        energyUserId: params.energyUserId,
        custodialWalletAddress: walletAddress,
        custodialWalletSecretJson: userSecretJson,
        kzteTokenAccountAddress: kzteTokenAccount.address.toBase58(),
        energyPointsTokenAccountAddress: energyPointsAccount.tokenAccountAddress,
        walletStatus: 'ACTIVE',
        initialKzteAirdropped: true,
        initialKzteAirdropTx: mintTx,
      },
    });
  }
}