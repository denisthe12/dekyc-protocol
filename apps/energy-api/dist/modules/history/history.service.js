"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HistoryService = class HistoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserHistory(energyUserId) {
        const [primaryBuys, claims, soldListings, boughtListings, assets] = await Promise.all([
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
        const events = [];
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
            const payoutMode = claim.payoutMode === 'ENERGY_POINTS' ? 'ENERGY_POINTS' : 'KZTE';
            const amountBaseUnits = payoutMode === 'ENERGY_POINTS'
                ? claim.claimedAmountEnergyPoints
                : claim.claimedAmountKzte;
            const publicAssetId = assetIdByDbId.get(claim.energyAssetId) ?? 'UNKNOWN_ASSET';
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
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HistoryService);
//# sourceMappingURL=history.service.js.map