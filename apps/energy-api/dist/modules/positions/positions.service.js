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
exports.PositionsService = void 0;
const common_1 = require("@nestjs/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const prisma_service_1 = require("../prisma/prisma.service");
const solana_service_1 = require("../solana/solana.service");
let PositionsService = class PositionsService {
    constructor(prisma, solanaService) {
        this.prisma = prisma;
        this.solanaService = solanaService;
    }
    async recordPurchase(params) {
        const existing = await this.prisma.energyInvestorPosition.findUnique({
            where: {
                energyUserId_energyAssetId_payoutMode: {
                    energyUserId: params.energyUserId,
                    energyAssetId: params.energyAssetId,
                    payoutMode: params.payoutMode,
                },
            },
        });
        if (!existing) {
            return this.prisma.energyInvestorPosition.create({
                data: {
                    energyUserId: params.energyUserId,
                    energyAssetId: params.energyAssetId,
                    assetId: params.assetId,
                    assetPda: params.assetPda,
                    shareMintAddress: params.shareMintAddress,
                    buyerWalletAddress: params.buyerWalletAddress,
                    buyerKzteAccount: params.buyerKzteAccount,
                    buyerShareAccount: params.buyerShareAccount,
                    payoutMode: params.payoutMode,
                    totalSharesPurchased: params.purchasedShares,
                    totalKzteSpent: params.spentKzte,
                    averagePricePerShare: Math.floor(params.spentKzte / params.purchasedShares),
                    lastPurchaseTx: params.purchaseTx,
                    status: 'ACTIVE',
                },
            });
        }
        const newShares = existing.totalSharesPurchased + params.purchasedShares;
        const newSpent = existing.totalKzteSpent + params.spentKzte;
        return this.prisma.energyInvestorPosition.update({
            where: {
                id: existing.id,
            },
            data: {
                assetId: params.assetId,
                assetPda: params.assetPda,
                shareMintAddress: params.shareMintAddress,
                buyerWalletAddress: params.buyerWalletAddress,
                buyerKzteAccount: params.buyerKzteAccount,
                buyerShareAccount: params.buyerShareAccount,
                payoutMode: params.payoutMode,
                totalSharesPurchased: newShares,
                totalKzteSpent: newSpent,
                averagePricePerShare: Math.floor(newSpent / newShares),
                lastPurchaseTx: params.purchaseTx,
                status: 'ACTIVE',
            },
        });
    }
    async reconcilePosition(params) {
        const asset = await this.prisma.energyAsset.findUniqueOrThrow({
            where: {
                assetId: params.assetId,
            },
        });
        const position = await this.prisma.energyInvestorPosition.findUnique({
            where: {
                energyUserId_energyAssetId_payoutMode: {
                    energyUserId: params.energyUserId,
                    energyAssetId: asset.id,
                    payoutMode: params.payoutMode,
                },
            },
        });
        if (!position?.buyerShareAccount) {
            throw new Error('Investor position or buyer share account not found');
        }
        const connection = this.solanaService.getConnection();
        const tokenAccount = await (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(position.buyerShareAccount), undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const onchainShares = Number(tokenAccount.amount);
        const recalculatedTotalSpent = onchainShares * asset.pricePerShareKzte;
        const averagePricePerShare = onchainShares > 0
            ? Math.floor(recalculatedTotalSpent / onchainShares)
            : 0;
        const updated = await this.prisma.energyInvestorPosition.update({
            where: {
                energyUserId_energyAssetId_payoutMode: {
                    energyUserId: params.energyUserId,
                    energyAssetId: asset.id,
                    payoutMode: params.payoutMode,
                },
            },
            data: {
                totalSharesPurchased: onchainShares,
                totalKzteSpent: recalculatedTotalSpent,
                averagePricePerShare,
                status: onchainShares > 0 ? 'ACTIVE' : 'CLOSED',
            },
        });
        return {
            assetId: asset.assetId,
            energyAssetId: asset.id,
            buyerShareAccount: position.buyerShareAccount,
            onchainShares,
            recalculatedTotalSpent,
            updated,
        };
    }
    async getPortfolio(energyUserId) {
        return this.prisma.energyInvestorPosition.findMany({
            where: {
                energyUserId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async recordPrimaryBuyTx(params) {
        return this.prisma.energyPrimaryBuyTx.create({
            data: {
                energyUserId: params.energyUserId,
                energyAssetId: params.energyAssetId,
                assetId: params.assetId,
                assetPda: params.assetPda,
                shareMintAddress: params.shareMintAddress,
                buyerWalletAddress: params.buyerWalletAddress,
                buyerKzteAccount: params.buyerKzteAccount,
                buyerShareAccount: params.buyerShareAccount,
                payoutMode: params.payoutMode,
                shareAmount: params.shareAmount,
                pricePerShareKzte: params.pricePerShareKzte,
                totalKzteSpent: params.totalKzteSpent,
                txSignature: params.txSignature,
            },
        });
    }
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        solana_service_1.SolanaService])
], PositionsService);
//# sourceMappingURL=positions.service.js.map