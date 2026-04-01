import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

export type HistoryEventItem = {
  id: string;
  type:
    | 'INITIAL_KZTE_AIRDROP'
    | 'PRIMARY_BUY'
    | 'REVENUE_EPOCH_CREATED'
    | 'PAYOUT_CLAIM'
    | 'OTC_LISTING_CREATED'
    | 'OTC_LISTING_FILLED';
  title: string;
  description: string;
  assetId: string | null;
  txSignature: string | null;
  createdAt: string;
};

@Injectable()
export class HistoryService {
  public constructor(private readonly prisma: PrismaService) {}

  public async getUserHistory(energyUserId: string): Promise<HistoryEventItem[]> {
    const [wallet, positions, claims, soldListings, boughtListings, epochs] =
      await Promise.all([
        this.prisma.energyUserWallet.findUnique({
          where: { energyUserId },
        }),
        this.prisma.energyInvestorPosition.findMany({
          where: { energyUserId },
          orderBy: { updatedAt: 'desc' },
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
        this.prisma.energyRevenueEpoch.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    const events: HistoryEventItem[] = [];

    if (wallet?.initialKzteAirdropTx) {
      events.push({
        id: `airdrop-${wallet.id}`,
        type: 'INITIAL_KZTE_AIRDROP',
        title: 'Initial KZTE airdrop',
        description: 'User received initial demo KZTE allocation.',
        assetId: null,
        txSignature: wallet.initialKzteAirdropTx,
        createdAt: wallet.updatedAt.toISOString(),
      });
    }

    for (const position of positions) {
      if (position.lastPurchaseTx) {
        events.push({
          id: `buy-${position.id}-${position.lastPurchaseTx}`,
          type: 'PRIMARY_BUY',
          title: 'Primary market purchase',
          description: `Bought ${position.totalSharesPurchased} shares for asset ${position.assetId}.`,
          assetId: position.assetId,
          txSignature: position.lastPurchaseTx,
          createdAt: position.updatedAt.toISOString(),
        });
      }
    }

    for (const claim of claims) {
      events.push({
        id: `claim-${claim.id}`,
        type: 'PAYOUT_CLAIM',
        title: 'Payout claim',
        description: `Claimed ${claim.claimedAmountKzte} base units from revenue epoch.`,
        assetId: null,
        txSignature: claim.claimTx,
        createdAt: claim.createdAt.toISOString(),
      });
    }

    for (const listing of soldListings) {
      events.push({
        id: `otc-create-${listing.id}`,
        type: 'OTC_LISTING_CREATED',
        title: 'OTC listing created',
        description: `Created OTC listing for ${listing.shareAmount} shares of asset ${listing.assetId}.`,
        assetId: listing.assetId,
        txSignature: listing.createListingTx,
        createdAt: listing.createdAt.toISOString(),
      });

      if (listing.fillListingTx) {
        events.push({
          id: `otc-filled-seller-${listing.id}`,
          type: 'OTC_LISTING_FILLED',
          title: 'OTC listing filled',
          description: `Your OTC listing for asset ${listing.assetId} was filled.`,
          assetId: listing.assetId,
          txSignature: listing.fillListingTx,
          createdAt: listing.updatedAt.toISOString(),
        });
      }
    }

    for (const listing of boughtListings) {
      if (listing.fillListingTx) {
        events.push({
          id: `otc-filled-buyer-${listing.id}`,
          type: 'OTC_LISTING_FILLED',
          title: 'OTC purchase completed',
          description: `Bought ${listing.shareAmount} OTC shares of asset ${listing.assetId}.`,
          assetId: listing.assetId,
          txSignature: listing.fillListingTx,
          createdAt: listing.updatedAt.toISOString(),
        });
      }
    }

    for (const epoch of epochs) {
      if (epoch.createEpochTx) {
        events.push({
          id: `epoch-${epoch.id}`,
          type: 'REVENUE_EPOCH_CREATED',
          title: 'Revenue epoch created',
          description: `Revenue epoch #${epoch.epochIndex} created.`,
          assetId: null,
          txSignature: epoch.createEpochTx,
          createdAt: epoch.createdAt.toISOString(),
        });
      }
    }

    return events.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}