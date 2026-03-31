import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';

@Injectable()
export class OtcService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly anchorService: AnchorService,
    private readonly solanaService: SolanaService,
  ) {}

  public async createDemoListing(params: {
    energyUserId: string;
    assetId: string;
    shareAmount: number;
    pricePerShareKzte: number;
  }) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId: params.assetId },
    });

    const wallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
      where: { energyUserId: params.energyUserId },
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
      throw new Error('Seller custodial key is missing');
    }

    const sellerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret));
    const signer = await this.solanaService.getSigner();
    const program = this.anchorService.program;
    const provider = this.anchorService.provider;

    const sellerShareAccountPk = new PublicKey(position.buyerShareAccount);
    const sellerShareAccountInfo = await getAccount(
      provider.connection,
      sellerShareAccountPk,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const onchainSellerShares = Number(sellerShareAccountInfo.amount);
    if (onchainSellerShares < params.shareAmount) {
      throw new Error(
        `Not enough shares for listing. onchain=${onchainSellerShares}, requested=${params.shareAmount}`,
      );
    }

    const listingIdBn = new anchor.BN(Date.now());
    const assetIdBn = new anchor.BN(asset.assetId);

    const [listingPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('listing'),
        assetIdBn.toArrayLike(Buffer, 'le', 8),
        listingIdBn.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId,
    );

    const escrowShareAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      new PublicKey(asset.shareMintAddress),
      listingPda,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = await program.methods
      .createListing(
        listingIdBn,
        new anchor.BN(params.shareAmount),
        new anchor.BN(params.pricePerShareKzte),
      )
      .accounts({
        seller: sellerKeypair.publicKey,
        relayer: signer.publicKey,
        energyAsset: new PublicKey(asset.assetPda),
        shareMint: new PublicKey(asset.shareMintAddress),
        sellerShareAccount: sellerShareAccountPk,
        sellerKzteAccount: new PublicKey(wallet.kzteTokenAccountAddress ?? ''),
        escrowShareAccount: escrowShareAccount.address,
        listing: listingPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([sellerKeypair, signer])
      .rpc();

    const totalPriceKzte = params.shareAmount * params.pricePerShareKzte;

    const created = await this.prisma.energyOtcListing.create({
      data: {
        listingId: listingIdBn.toString(),
        energyAssetId: asset.id,
        sellerEnergyUserId: params.energyUserId,
        buyerEnergyUserId: null,
        assetId: asset.assetId,
        assetPda: asset.assetPda,
        listingPda: listingPda.toBase58(),
        shareMintAddress: asset.shareMintAddress,
        sellerWalletAddress: wallet.custodialWalletAddress,
        sellerShareAccount: position.buyerShareAccount,
        sellerKzteAccount: wallet.kzteTokenAccountAddress ?? '',
        escrowShareAccount: escrowShareAccount.address.toBase58(),
        shareAmount: params.shareAmount,
        pricePerShareKzte: params.pricePerShareKzte,
        totalPriceKzte,
        createListingTx: tx,
        fillListingTx: null,
        status: 'OPEN',
      },
    });

    return {
      listingPda: listingPda.toBase58(),
      escrowShareAccount: escrowShareAccount.address.toBase58(),
      tx,
      db: created,
    };
  }

  public async fillDemoListing(params: {
    energyUserId: string;
    listingId: string;
  }) {
    const listing = await this.prisma.energyOtcListing.findUniqueOrThrow({
      where: { listingId: params.listingId },
    });

    if (listing.status !== 'OPEN') {
      throw new Error('Listing is not open');
    }

    const buyerWallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
      where: { energyUserId: params.energyUserId },
    });

    const buyerSecret = buyerWallet.custodialWalletSecretJson as number[] | null;
    if (!buyerSecret) {
      throw new Error('Buyer custodial key is missing');
    }

    const buyerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(buyerSecret));
    const signer = await this.solanaService.getSigner();
    const provider = this.anchorService.provider;
    const program = this.anchorService.program;

    const buyerShareAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      new PublicKey(listing.shareMintAddress),
      buyerKeypair.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = await program.methods
      .fillListing()
      .accounts({
        buyer: buyerKeypair.publicKey,
        listing: new PublicKey(listing.listingPda),
        energyAsset: new PublicKey(listing.assetPda),
        kzteMint: this.solanaService.getKzteMint(),
        shareMint: new PublicKey(listing.shareMintAddress),
        buyerKzteAccount: new PublicKey(buyerWallet.kzteTokenAccountAddress ?? ''),
        buyerShareAccount: buyerShareAccount.address,
        sellerKzteAccount: new PublicKey(listing.sellerKzteAccount),
        escrowShareAccount: new PublicKey(listing.escrowShareAccount),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([buyerKeypair])
      .rpc();

    const updated = await this.prisma.energyOtcListing.update({
      where: { listingId: params.listingId },
      data: {
        buyerEnergyUserId: params.energyUserId,
        fillListingTx: tx,
        status: 'FILLED',
      },
    });

    return {
      buyerWallet: buyerWallet.custodialWalletAddress,
      buyerShareAccount: buyerShareAccount.address.toBase58(),
      tx,
      db: updated,
    };
  }

  public async listOpenListings() {
    return this.prisma.energyOtcListing.findMany({
      where: {
        status: 'OPEN',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}