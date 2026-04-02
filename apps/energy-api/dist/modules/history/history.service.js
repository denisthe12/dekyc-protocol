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
        const [wallet, positions, claims, soldListings, boughtListings, epochs] = await Promise.all([
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
        const events = [];
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
            const payoutLabel = claim.payoutMode === 'ENERGY_POINTS' ? 'ENERGY_POINTS' : 'KZTE';
            const amount = claim.payoutMode === 'ENERGY_POINTS'
                ? claim.claimedAmountEnergyPoints
                : claim.claimedAmountKzte;
            events.push({
                id: `claim-${claim.id}`,
                type: 'PAYOUT_CLAIM',
                title: 'Payout claim',
                description: `Claimed ${amount} base units in ${payoutLabel}.`,
                assetId: null,
                txSignature: claim.energyPointsMintTx ?? claim.claimTx,
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
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HistoryService);
//# sourceMappingURL=history.service.js.map