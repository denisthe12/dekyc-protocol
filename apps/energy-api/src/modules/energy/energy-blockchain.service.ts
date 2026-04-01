import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { sha256FromObject } from './utils/hash.util';
import { buildEnergyMetadata } from './utils/metadata.util';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { PositionsService } from '../positions/positions.service';

export type CreatedEnergyAssetResult = {
  registryPda: string;
  registryTx: string | null;
  assetId: string;
  assetPda: string;
  shareMint: string;
  treasuryShareAccount: string;
  treasuryKzteAccount: string;
  createAssetTx: string;
  issueSharesTx: string;
  metadata: {
    title: string;
    description: string;
    location: string;
    assetType: string;
    totalShares: number;
    pricePerShareKzte: number;
    investorBps: number;
    operatorBps: number;
    payoutMode: string;
    createdAt: string;
  };
  metadataHash: string;
};

@Injectable()
export class EnergyBlockchainService {
  public constructor(
    private readonly anchorService: AnchorService,
    private readonly solanaService: SolanaService,
    private readonly prisma: PrismaService,
    private readonly positionsService: PositionsService,
  ) {}

  public async getRegistryPda(): Promise<PublicKey> {
    const program = this.anchorService.program;

    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      program.programId,
    );

    return registryPda;
  }

  public async createRegistryIfNeeded(): Promise<{
    registryPda: string;
    tx: string | null;
  }> {
    const program = this.anchorService.program;
    const provider = this.anchorService.provider;
    const registryPda = await this.getRegistryPda();

    const existing = await provider.connection.getAccountInfo(registryPda, 'confirmed');
    if (existing) {
      return {
        registryPda: registryPda.toBase58(),
        tx: null,
      };
    }

    const tx = await program.methods
      .createRegistry()
      .accounts({
        admin: provider.wallet.publicKey,
        kzteMint: this.solanaService.getKzteMint(),
        registry: registryPda,
      })
      .rpc();

    return {
      registryPda: registryPda.toBase58(),
      tx,
    };
  }

  public async createEnergyAsset(): Promise<CreatedEnergyAssetResult> {
    const provider = this.anchorService.provider;
    const program = this.anchorService.program;
    const signer = await this.solanaService.getSigner();

    const registry = await this.createRegistryIfNeeded();

    const assetIdBn = new anchor.BN(Date.now());
    const assetIdLe = assetIdBn.toArrayLike(Buffer, 'le', 8);

    const [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('energy_asset'), assetIdLe],
      program.programId,
    );

    const shareMint = await createMint(
      provider.connection,
      signer,
      assetPda,
      null,
      0,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const treasuryShareAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      shareMint,
      assetPda,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const treasuryKzteAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      this.solanaService.getKzteMint(),
      assetPda,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const metadata = buildEnergyMetadata({
      assetId: assetIdBn.toString(),
    });

    const metadataHashBuffer = sha256FromObject(metadata);
    const metadataUriHash = Array.from(metadataHashBuffer);
    const proofRootHash = new Array(32).fill(0);

    const createAssetTx = await program.methods
      .createEnergyAsset(
        assetIdBn,
        new anchor.BN(1000),
        new anchor.BN(10000),
        8000,
        2000,
        { kzte: {} },
        proofRootHash,
        metadataUriHash,
      )
      .accounts({
        issuer: provider.wallet.publicKey,
        registry: new PublicKey(registry.registryPda),
        shareMint,
        treasuryShareAccount: treasuryShareAccount.address,
        treasuryKzteAccount: treasuryKzteAccount.address,
        energyAsset: assetPda,
      })
      .rpc();

    const issueSharesTx = await program.methods
      .issueShares()
      .accounts({
        issuer: provider.wallet.publicKey,
        energyAsset: assetPda,
        shareMint,
        treasuryShareAccount: treasuryShareAccount.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    return {
      registryPda: registry.registryPda,
      registryTx: registry.tx,
      assetId: assetIdBn.toString(),
      assetPda: assetPda.toBase58(),
      shareMint: shareMint.toBase58(),
      treasuryShareAccount: treasuryShareAccount.address.toBase58(),
      treasuryKzteAccount: treasuryKzteAccount.address.toBase58(),
      createAssetTx,
      issueSharesTx,
      metadata,
      metadataHash: metadataHashBuffer.toString('hex'),
    };
  }

  public async buyDemoShares(params: {
    energyUserId: string;
    assetId: string;
    shareAmount: number;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
  }) {
    const provider = this.anchorService.provider;
    const program = this.anchorService.program;
    const backendSigner = await this.solanaService.getSigner();

    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: {
        assetId: params.assetId,
      },
    });

    const wallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    const secret = wallet.custodialWalletSecretJson as number[] | null;
    if (!secret) {
      throw new Error('User custodial key is missing');
    }

    const buyerKeypair = anchor.web3.Keypair.fromSecretKey(
      Uint8Array.from(secret),
    );

    const buyerShareAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      backendSigner,
      new PublicKey(asset.shareMintAddress),
      buyerKeypair.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = await program.methods
      .buyShares(
        new anchor.BN(params.shareAmount),
        params.payoutMode === 'KZTE' ? { kzte: {} } : { energyPoints: {} },
      )
      .accounts({
        buyer: buyerKeypair.publicKey,
        energyAsset: new PublicKey(asset.assetPda),
        kzteMint: this.solanaService.getKzteMint(),
        shareMint: new PublicKey(asset.shareMintAddress),
        treasuryKzteAccount: new PublicKey(asset.treasuryKzteAccount),
        treasuryShareAccount: new PublicKey(asset.treasuryShareAccount),
        buyerKzteAccount: new PublicKey(
          wallet.kzteTokenAccountAddress ?? '',
        ),
        buyerShareAccount: buyerShareAccount.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        investorPosition: PublicKey.findProgramAddressSync(
          [
            Buffer.from('investor_position'),
            new PublicKey(asset.assetPda).toBuffer(),
            buyerKeypair.publicKey.toBuffer(),
            params.payoutMode === 'KZTE' ? Buffer.from([0]) : Buffer.from([1]),
          ],
          program.programId,
        )[0],
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyerKeypair])
      .rpc();

    const totalKzteSpent = params.shareAmount * asset.pricePerShareKzte;

    const position = await this.positionsService.recordPurchase({
      energyUserId: params.energyUserId,
      energyAssetId: asset.id,
      assetId: asset.assetId,
      assetPda: asset.assetPda,
      shareMintAddress: asset.shareMintAddress,
      buyerWalletAddress: wallet.custodialWalletAddress,
      buyerKzteAccount: wallet.kzteTokenAccountAddress,
      buyerShareAccount: buyerShareAccount.address.toBase58(),
      purchasedShares: params.shareAmount,
      spentKzte: totalKzteSpent,
      payoutMode: params.payoutMode,
      purchaseTx: tx,
    });

    return {
      assetId: asset.assetId,
      assetPda: asset.assetPda,
      buyerWallet: wallet.custodialWalletAddress,
      buyerKzteAccount: wallet.kzteTokenAccountAddress,
      buyerShareAccount: buyerShareAccount.address.toBase58(),
      treasuryKzteAccount: asset.treasuryKzteAccount,
      treasuryShareAccount: asset.treasuryShareAccount,
      tx,
      position,
    };
  }

  public async getInvestorPosition(params: {
    assetPda: string;
    investorWallet: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
  }) {
    const program = this.anchorService.program;

    const [investorPositionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('investor_position'),
        new PublicKey(params.assetPda).toBuffer(),
        new PublicKey(params.investorWallet).toBuffer(),
        params.payoutMode === 'KZTE' ? Buffer.from([0]) : Buffer.from([1]),
      ],
      program.programId,
    );

    const investorPosition = await (program.account as any).investorPosition.fetchNullable(
      investorPositionPda,
    );

    return {
      investorPositionPda: investorPositionPda.toBase58(),
      investorPosition,
    };
  }
}