import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';

@Injectable()
export class PayoutsService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly anchorService: AnchorService,
    private readonly solanaService: SolanaService,
  ) {}

  public async createRevenueEpoch(params: {
    assetId: string;
    totalAmountKzte: number;
  }) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId: params.assetId },
    });

    const existingEpochCount = await this.prisma.energyRevenueEpoch.count({
      where: {
        energyAssetId: asset.id,
      },
    });

    const epochIndex = existingEpochCount + 1;
    const epochIndexBn = new anchor.BN(epochIndex);

    const program = this.anchorService.program;
    const provider = this.anchorService.provider;
    const signer = await this.solanaService.getSigner();

    const assetIdAsU64 = new anchor.BN(asset.assetId);
    const [epochPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('revenue_epoch'),
        assetIdAsU64.toArrayLike(Buffer, 'le', 8),
        epochIndexBn.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId,
    );

    const issuerKzteAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      this.solanaService.getKzteMint(),
      signer.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = await program.methods
      .createRevenueEpoch(
        epochIndexBn,
        new anchor.BN(params.totalAmountKzte),
      )
      .accounts({
        issuer: signer.publicKey,
        energyAsset: new PublicKey(asset.assetPda),
        kzteMint: this.solanaService.getKzteMint(),
        treasuryKzteAccount: new PublicKey(asset.treasuryKzteAccount),
        issuerKzteAccount: issuerKzteAccount.address,
        revenueEpoch: epochPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([signer])
      .rpc();

    const created = await this.prisma.energyRevenueEpoch.create({
      data: {
        energyAssetId: asset.id,
        epochIndex,
        revenueEpochPda: epochPda.toBase58(),
        treasuryKzteAccount: asset.treasuryKzteAccount,
        totalAmountKzte: params.totalAmountKzte,
        amountPerShareKzte: Math.floor(params.totalAmountKzte / asset.totalShares),
        totalSharesSnapshot: asset.totalShares,
        createEpochTx: tx,
        status: 'OPEN',
      },
    });

    return {
      assetId: asset.assetId,
      epochIndex,
      revenueEpochPda: epochPda.toBase58(),
      createEpochTx: tx,
      db: created,
    };
  }

  public async claimPayout(params: {
    energyUserId: string;
    assetId: string;
    epochIndex: number;
  }) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId: params.assetId },
    });

    const epoch = await this.prisma.energyRevenueEpoch.findUniqueOrThrow({
      where: {
        energyAssetId_epochIndex: {
          energyAssetId: asset.id,
          epochIndex: params.epochIndex,
        },
      },
    });

    const wallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    const position = await this.prisma.energyInvestorPosition.findUniqueOrThrow({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
        },
      },
    });

    const secret = wallet.custodialWalletSecretJson as number[] | null;
    if (!secret) {
      throw new Error('User custodial key is missing');
    }

    const claimerKeypair = anchor.web3.Keypair.fromSecretKey(
      Uint8Array.from(secret),
    );

    const program = this.anchorService.program;

    const epochPda = new PublicKey(epoch.revenueEpochPda);

    const [claimReceiptPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('claim_receipt'),
        epochPda.toBuffer(),
        claimerKeypair.publicKey.toBuffer(),
      ],
      program.programId,
    );

    const tx = await program.methods
      .claimPayout()
      .accounts({
        claimer: claimerKeypair.publicKey,
        energyAsset: new PublicKey(asset.assetPda),
        revenueEpoch: epochPda,
        kzteMint: this.solanaService.getKzteMint(),
        treasuryKzteAccount: new PublicKey(asset.treasuryKzteAccount),
        claimerKzteAccount: new PublicKey(wallet.kzteTokenAccountAddress ?? ''),
        claimerShareAccount: new PublicKey(position.buyerShareAccount),
        claimReceipt: claimReceiptPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([claimerKeypair])
      .rpc();

    const claimedAmountKzte =
      position.totalSharesPurchased * epoch.amountPerShareKzte;

    const claim = await this.prisma.energyPayoutClaim.create({
      data: {
        energyUserId: params.energyUserId,
        energyAssetId: asset.id,
        energyRevenueEpochId: epoch.id,
        claimReceiptPda: claimReceiptPda.toBase58(),
        claimerWalletAddress: wallet.custodialWalletAddress,
        claimerKzteAccount: wallet.kzteTokenAccountAddress ?? '',
        claimerShareAccount: position.buyerShareAccount,
        claimedAmountKzte,
        claimTx: tx,
      },
    });

    return {
      assetId: asset.assetId,
      epochIndex: epoch.epochIndex,
      claimReceiptPda: claimReceiptPda.toBase58(),
      claimedAmountKzte,
      tx,
      db: claim,
    };
  }

  public async listEpochs(assetId: string) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId },
    });

    return this.prisma.energyRevenueEpoch.findMany({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: {
        epochIndex: 'desc',
      },
    });
  }
}