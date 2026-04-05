import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

export type HistoryEventItem = {
  id: string;
  type: 'PRIMARY_BUY' | 'OTC_LISTING_CREATED' | 'OTC_LISTING_FILLED' | 'CLAIM';
  assetId: string;
  title: string;
  payoutMode: 'KZTE' | 'ENERGY_POINTS' | null;
  amountBaseUnits: number | null;
  shareAmount: number | null;
  tx: string | null;
  secondaryTx: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class HistoryService {
  public constructor(private readonly prisma: PrismaService) {}

  public async getUserHistory(energyUserId: string): Promise<HistoryEventItem[]> {
    const [primaryBuys, claims, soldListings, boughtListings, assets] =
      await Promise.all([
        this.prisma.energyPrimaryBuyTx.findMany({
          where: { energyUserId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.energyPayoutClaim.findMany({
          where: { energyUserId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.energyOtcListing.findMany({
          where: { sellerEnergyUserId: energyUserId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.energyOtcListing.findMany({
          where: { buyerEnergyUserId: energyUserId },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.energyAsset.findMany({
          select: {
            id: true,
            assetId: true,
          },
        }),
      ]);

    const assetIdByDbId = new Map(assets.map((asset) => [asset.id, asset.assetId]));
    const events: HistoryEventItem[] = [];

    for (const buy of primaryBuys) {
      events.push({
        id: `buy-${buy.id}`,
        type: 'PRIMARY_BUY',
        title: 'Primary market purchase',
        assetId: buy.assetId,
        payoutMode: buy.payoutMode,
        amountBaseUnits: buy.totalKzteSpent,
        shareAmount: buy.shareAmount,
        tx: buy.txSignature,
        secondaryTx: null,
        createdAt: buy.createdAt.toISOString(),
        metadata: {
          buyerShareAccount: buy.buyerShareAccount,
          buyerWalletAddress: buy.buyerWalletAddress,
          shareMintAddress: buy.shareMintAddress,
          averagePricePerShare: buy.pricePerShareKzte,
        },
      });
    }

    for (const claim of claims) {
      const payoutMode: 'KZTE' | 'ENERGY_POINTS' =
        claim.payoutMode === 'ENERGY_POINTS' ? 'ENERGY_POINTS' : 'KZTE';

      const amountBaseUnits =
        payoutMode === 'ENERGY_POINTS'
          ? claim.claimedAmountEnergyPoints
          : claim.claimedAmountKzte;

      const publicAssetId =
        assetIdByDbId.get(claim.energyAssetId) ?? 'UNKNOWN_ASSET';

      events.push({
        id: `claim-${claim.id}`,
        type: 'CLAIM',
        title: 'Payout claim',
        assetId: publicAssetId,
        payoutMode,
        amountBaseUnits,
        shareAmount: null,
        tx: claim.claimTx,
        secondaryTx: claim.energyPointsMintTx,
        createdAt: claim.createdAt.toISOString(),
        metadata: {
          claimReceiptPda: claim.claimReceiptPda,
          claimerWalletAddress: claim.claimerWalletAddress,
          claimerShareAccount: claim.claimerShareAccount,
          claimerKzteAccount: claim.claimerKzteAccount,
        },
      });
    }

    for (const listing of soldListings) {
      events.push({
        id: `otc-create-${listing.id}`,
        type: 'OTC_LISTING_CREATED',
        title: 'OTC listing created',
        assetId: listing.assetId,
        payoutMode: listing.payoutMode,
        amountBaseUnits: listing.totalPriceKzte,
        shareAmount: listing.shareAmount,
        tx: listing.createListingTx,
        secondaryTx: null,
        createdAt: listing.createdAt.toISOString(),
        metadata: {
          listingId: listing.listingId,
          listingPda: listing.listingPda,
          sellerWalletAddress: listing.sellerWalletAddress,
          escrowShareAccount: listing.escrowShareAccount,
        },
      });

      if (listing.fillListingTx) {
        events.push({
          id: `otc-filled-seller-${listing.id}`,
          type: 'OTC_LISTING_FILLED',
          title: 'OTC listing filled',
          assetId: listing.assetId,
          payoutMode: listing.payoutMode,
          amountBaseUnits: listing.totalPriceKzte,
          shareAmount: listing.shareAmount,
          tx: listing.fillListingTx,
          secondaryTx: listing.createListingTx,
          createdAt: listing.updatedAt.toISOString(),
          metadata: {
            listingId: listing.listingId,
            role: 'SELLER',
          },
        });
      }
    }

    for (const listing of boughtListings) {
      if (!listing.fillListingTx) {
        continue;
      }

      events.push({
        id: `otc-filled-buyer-${listing.id}`,
        type: 'OTC_LISTING_FILLED',
        title: 'OTC purchase completed',
        assetId: listing.assetId,
        payoutMode: listing.payoutMode,
        amountBaseUnits: listing.totalPriceKzte,
        shareAmount: listing.shareAmount,
        tx: listing.fillListingTx,
        secondaryTx: listing.createListingTx,
        createdAt: listing.updatedAt.toISOString(),
        metadata: {
          listingId: listing.listingId,
          role: 'BUYER',
        },
      });
    }

    return events.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}