import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { EnergyPointsService } from '@/modules/solana/energy-points.service';
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
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
    private readonly energyPointsService: EnergyPointsService,
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

  private async claimBucket(params: {
    program: anchor.Program;
    provider: anchor.AnchorProvider;
    energyUserId: string;
    claimerKeypair: anchor.web3.Keypair;
    asset: {
      id: string;
      assetId: string;
      assetPda: string;
    };
    epoch: {
      id: string;
      epochIndex: number;
      revenueEpochPda: string;
      treasuryKzteAccount: string;
      amountPerShareKzte: number;
    };
    wallet: {
      custodialWalletAddress: string;
      kzteTokenAccountAddress: string | null;
      energyPointsTokenAccountAddress: string | null;
    };
    position: {
      buyerShareAccount: string;
      totalSharesPurchased: number;
      payoutMode: 'KZTE' | 'ENERGY_POINTS';
    };
  }) {
    const modeSeed =
      params.position.payoutMode === 'KZTE' ? Buffer.from([0]) : Buffer.from([1]);

    const [investorPositionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('investor_position'),
        new PublicKey(params.asset.assetPda).toBuffer(),
        params.claimerKeypair.publicKey.toBuffer(),
        modeSeed,
      ],
      params.program.programId,
    );

    const [claimReceiptPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('claim_receipt'),
        new PublicKey(params.epoch.revenueEpochPda).toBuffer(),
        params.claimerKeypair.publicKey.toBuffer(),
        modeSeed,
      ],
      params.program.programId,
    );

    const claimAmount =
      params.position.totalSharesPurchased * params.epoch.amountPerShareKzte;

    if (claimAmount <= 0) {
      return null;
    }

    const tx = await params.program.methods
      .claimPayout(
        new anchor.BN(claimAmount),
        params.position.payoutMode === 'KZTE'
          ? { kzte: {} }
          : { energyPoints: {} },
      )
      .accounts({
        claimer: params.claimerKeypair.publicKey,
        energyAsset: new PublicKey(params.asset.assetPda),
        revenueEpoch: new PublicKey(params.epoch.revenueEpochPda),
        investorPosition: investorPositionPda,
        kzteMint: this.solanaService.getKzteMint(),
        treasuryKzteAccount: new PublicKey(params.epoch.treasuryKzteAccount),
        claimerKzteAccount: new PublicKey(params.wallet.kzteTokenAccountAddress ?? ''),
        claimReceipt: claimReceiptPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([params.claimerKeypair])
      .rpc();

    let energyPointsMintTx: string | null = null;

    if (params.position.payoutMode === 'ENERGY_POINTS') {
      if (!params.wallet.energyPointsTokenAccountAddress) {
        throw new Error('User ENERGY_POINTS token account is missing');
      }

      const mintResult = await this.energyPointsService.mintEnergyPointsToUser({
        recipientTokenAccount: params.wallet.energyPointsTokenAccountAddress,
        amountBaseUnits: BigInt(claimAmount),
      });

      energyPointsMintTx = mintResult.tx;
    }

    const claim = await this.prisma.energyPayoutClaim.create({
      data: {
        energyUserId: params.energyUserId,
        energyAssetId: params.asset.id,
        energyRevenueEpochId: params.epoch.id,
        claimReceiptPda: claimReceiptPda.toBase58(),
        claimerWalletAddress: params.wallet.custodialWalletAddress,
        claimerKzteAccount: params.wallet.kzteTokenAccountAddress ?? '',
        claimerShareAccount: params.position.buyerShareAccount,
        claimedAmountKzte:
          params.position.payoutMode === 'KZTE' ? claimAmount : 0,
        claimedAmountEnergyPoints:
          params.position.payoutMode === 'ENERGY_POINTS' ? claimAmount : 0,
        payoutMode: params.position.payoutMode,
        claimTx: tx,
        energyPointsMintTx,
      },
    });

    return {
      investorPositionPda: investorPositionPda.toBase58(),
      claimReceiptPda: claimReceiptPda.toBase58(),
      claimAmount,
      payoutMode: params.position.payoutMode,
      tx,
      energyPointsMintTx,
      db: claim,
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

    if (!wallet.energyPointsTokenAccountAddress) {
      throw new Error('User ENERGY_POINTS token account is missing');
    }

    const secret = wallet.custodialWalletSecretJson as number[] | null;
    if (!secret) {
      throw new Error('User custodial key is missing');
    }

    const claimerKeypair = anchor.web3.Keypair.fromSecretKey(
      Uint8Array.from(secret),
    );

    const program = this.anchorService.program;
    const provider = this.anchorService.provider;

    const positions = await this.prisma.energyInvestorPosition.findMany({
      where: {
        energyUserId: params.energyUserId,
        energyAssetId: asset.id,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (positions.length === 0) {
      throw new Error('Investor positions not found for this asset');
    }

    const kztePosition =
      positions.find((item) => item.payoutMode === 'KZTE') ?? null;

    const energyPointsPosition =
      positions.find((item) => item.payoutMode === 'ENERGY_POINTS') ?? null;

    if (!kztePosition && !energyPointsPosition) {
      throw new Error('No active payout positions found for this asset');
    }

    const solTopUp = await this.solanaService.ensureSolBalance(
      wallet.custodialWalletAddress,
      0.02,
      0.1,
    );

    console.log('SOL top-up result:', solTopUp);

    const bucketClaims = [];

    if (kztePosition && kztePosition.totalSharesPurchased > 0) {
      const claimResult = await this.claimBucket({
        program,
        provider,
        energyUserId: params.energyUserId,
        claimerKeypair,
        asset: {
          id: asset.id,
          assetId: asset.assetId,
          assetPda: asset.assetPda,
        },
        epoch: {
          id: epoch.id,
          epochIndex: epoch.epochIndex,
          revenueEpochPda: epoch.revenueEpochPda,
          treasuryKzteAccount: epoch.treasuryKzteAccount,
          amountPerShareKzte: epoch.amountPerShareKzte,
        },
        wallet: {
          custodialWalletAddress: wallet.custodialWalletAddress,
          kzteTokenAccountAddress: wallet.kzteTokenAccountAddress,
          energyPointsTokenAccountAddress:
            wallet.energyPointsTokenAccountAddress,
        },
        position: {
          buyerShareAccount: kztePosition.buyerShareAccount,
          totalSharesPurchased: kztePosition.totalSharesPurchased,
          payoutMode: 'KZTE',
        },
      });

      if (claimResult) {
        bucketClaims.push(claimResult);
      }
    }

    if (energyPointsPosition && energyPointsPosition.totalSharesPurchased > 0) {
      const claimResult = await this.claimBucket({
        program,
        provider,
        energyUserId: params.energyUserId,
        claimerKeypair,
        asset: {
          id: asset.id,
          assetId: asset.assetId,
          assetPda: asset.assetPda,
        },
        epoch: {
          id: epoch.id,
          epochIndex: epoch.epochIndex,
          revenueEpochPda: epoch.revenueEpochPda,
          treasuryKzteAccount: epoch.treasuryKzteAccount,
          amountPerShareKzte: epoch.amountPerShareKzte,
        },
        wallet: {
          custodialWalletAddress: wallet.custodialWalletAddress,
          kzteTokenAccountAddress: wallet.kzteTokenAccountAddress,
          energyPointsTokenAccountAddress:
            wallet.energyPointsTokenAccountAddress,
        },
        position: {
          buyerShareAccount: energyPointsPosition.buyerShareAccount,
          totalSharesPurchased: energyPointsPosition.totalSharesPurchased,
          payoutMode: 'ENERGY_POINTS',
        },
      });

      if (claimResult) {
        bucketClaims.push(claimResult);
      }
    }

    const totalKzteClaimAmount = bucketClaims
      .filter((item) => item.payoutMode === 'KZTE')
      .reduce((sum, item) => sum + item.claimAmount, 0);

    const totalEnergyPointsClaimAmount = bucketClaims
      .filter((item) => item.payoutMode === 'ENERGY_POINTS')
      .reduce((sum, item) => sum + item.claimAmount, 0);

    return {
      assetId: asset.assetId,
      epochIndex: epoch.epochIndex,
      totalKzteClaimAmount,
      totalEnergyPointsClaimAmount,
      claims: bucketClaims,
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

  public async listClaimsForUser(params: {
    energyUserId: string;
    assetId?: string;
  }) {
    const where: {
      energyUserId: string;
      energyAssetId?: string;
    } = {
      energyUserId: params.energyUserId,
    };

    if (params.assetId) {
      const asset = await this.prisma.energyAsset.findUniqueOrThrow({
        where: {
          assetId: params.assetId,
        },
      });

      where.energyAssetId = asset.id;
    }

    return this.prisma.energyPayoutClaim.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}