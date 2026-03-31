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
exports.OtcService = void 0;
const common_1 = require("@nestjs/common");
const anchor = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const prisma_service_1 = require("../prisma/prisma.service");
const anchor_service_1 = require("../solana/anchor.service");
const solana_service_1 = require("../solana/solana.service");
let OtcService = class OtcService {
    constructor(prisma, anchorService, solanaService) {
        this.prisma = prisma;
        this.anchorService = anchorService;
        this.solanaService = solanaService;
    }
    async createDemoListing(params) {
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
        const secret = wallet.custodialWalletSecretJson;
        if (!secret) {
            throw new Error('Seller custodial key is missing');
        }
        const sellerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret));
        const signer = await this.solanaService.getSigner();
        const program = this.anchorService.program;
        const provider = this.anchorService.provider;
        const sellerShareAccountPk = new web3_js_1.PublicKey(position.buyerShareAccount);
        const sellerShareAccountInfo = await (0, spl_token_1.getAccount)(provider.connection, sellerShareAccountPk, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const onchainSellerShares = Number(sellerShareAccountInfo.amount);
        if (onchainSellerShares < params.shareAmount) {
            throw new Error(`Not enough shares for listing. onchain=${onchainSellerShares}, requested=${params.shareAmount}`);
        }
        const listingIdBn = new anchor.BN(Date.now());
        const assetIdBn = new anchor.BN(asset.assetId);
        const [listingPda] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('listing'),
            assetIdBn.toArrayLike(Buffer, 'le', 8),
            listingIdBn.toArrayLike(Buffer, 'le', 8),
        ], program.programId);
        const escrowShareAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, signer, new web3_js_1.PublicKey(asset.shareMintAddress), listingPda, true, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const tx = await program.methods
            .createListing(listingIdBn, new anchor.BN(params.shareAmount), new anchor.BN(params.pricePerShareKzte))
            .accounts({
            seller: sellerKeypair.publicKey,
            relayer: signer.publicKey,
            energyAsset: new web3_js_1.PublicKey(asset.assetPda),
            shareMint: new web3_js_1.PublicKey(asset.shareMintAddress),
            sellerShareAccount: sellerShareAccountPk,
            sellerKzteAccount: new web3_js_1.PublicKey(wallet.kzteTokenAccountAddress ?? ''),
            escrowShareAccount: escrowShareAccount.address,
            listing: listingPda,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
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
    async fillDemoListing(params) {
        const listing = await this.prisma.energyOtcListing.findUniqueOrThrow({
            where: { listingId: params.listingId },
        });
        if (listing.status !== 'OPEN') {
            throw new Error('Listing is not open');
        }
        if (listing.sellerEnergyUserId === params.energyUserId) {
            throw new Error('Seller cannot fill own listing');
        }
        const buyerWallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
            where: { energyUserId: params.energyUserId },
        });
        const buyerSecret = buyerWallet.custodialWalletSecretJson;
        if (!buyerSecret) {
            throw new Error('Buyer custodial key is missing');
        }
        const buyerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(buyerSecret));
        const signer = await this.solanaService.getSigner();
        const provider = this.anchorService.provider;
        const program = this.anchorService.program;
        const buyerShareAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, signer, new web3_js_1.PublicKey(listing.shareMintAddress), buyerKeypair.publicKey, false, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const tx = await program.methods
            .fillListing()
            .accounts({
            buyer: buyerKeypair.publicKey,
            listing: new web3_js_1.PublicKey(listing.listingPda),
            energyAsset: new web3_js_1.PublicKey(listing.assetPda),
            kzteMint: this.solanaService.getKzteMint(),
            shareMint: new web3_js_1.PublicKey(listing.shareMintAddress),
            buyerKzteAccount: new web3_js_1.PublicKey(buyerWallet.kzteTokenAccountAddress ?? ''),
            buyerShareAccount: buyerShareAccount.address,
            sellerKzteAccount: new web3_js_1.PublicKey(listing.sellerKzteAccount),
            escrowShareAccount: new web3_js_1.PublicKey(listing.escrowShareAccount),
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
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
        await this.reconcilePositionsAfterFill({
            sellerEnergyUserId: listing.sellerEnergyUserId,
            buyerEnergyUserId: params.energyUserId,
            energyAssetId: listing.energyAssetId,
            assetId: listing.assetId,
            assetPda: listing.assetPda,
            shareMintAddress: listing.shareMintAddress,
            sellerBuyerShareAccount: listing.sellerShareAccount,
            buyerWalletAddress: buyerWallet.custodialWalletAddress,
            buyerKzteAccount: buyerWallet.kzteTokenAccountAddress,
            buyerShareAccount: buyerShareAccount.address.toBase58(),
            shareAmount: listing.shareAmount,
            totalPriceKzte: listing.totalPriceKzte,
        });
        return {
            buyerWallet: buyerWallet.custodialWalletAddress,
            buyerShareAccount: buyerShareAccount.address.toBase58(),
            tx,
            db: updated,
        };
    }
    async listOpenListings() {
        return this.prisma.energyOtcListing.findMany({
            where: {
                status: 'OPEN',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async reconcilePositionsAfterFill(params) {
        const sellerPosition = await this.prisma.energyInvestorPosition.findUnique({
            where: {
                energyUserId_energyAssetId: {
                    energyUserId: params.sellerEnergyUserId,
                    energyAssetId: params.energyAssetId,
                },
            },
        });
        if (sellerPosition) {
            const nextSellerShares = Math.max(0, sellerPosition.totalSharesPurchased - params.shareAmount);
            const nextSellerTotalSpent = nextSellerShares > 0
                ? nextSellerShares * sellerPosition.averagePricePerShare
                : 0;
            await this.prisma.energyInvestorPosition.update({
                where: { id: sellerPosition.id },
                data: {
                    totalSharesPurchased: nextSellerShares,
                    totalKzteSpent: nextSellerTotalSpent,
                    averagePricePerShare: nextSellerShares > 0 ? sellerPosition.averagePricePerShare : 0,
                    status: nextSellerShares > 0 ? 'ACTIVE' : 'CLOSED',
                },
            });
        }
        const buyerPosition = await this.prisma.energyInvestorPosition.findUnique({
            where: {
                energyUserId_energyAssetId: {
                    energyUserId: params.buyerEnergyUserId,
                    energyAssetId: params.energyAssetId,
                },
            },
        });
        if (!buyerPosition) {
            await this.prisma.energyInvestorPosition.create({
                data: {
                    energyUserId: params.buyerEnergyUserId,
                    energyAssetId: params.energyAssetId,
                    assetId: params.assetId,
                    assetPda: params.assetPda,
                    shareMintAddress: params.shareMintAddress,
                    buyerWalletAddress: params.buyerWalletAddress,
                    buyerKzteAccount: params.buyerKzteAccount,
                    buyerShareAccount: params.buyerShareAccount,
                    totalSharesPurchased: params.shareAmount,
                    totalKzteSpent: params.totalPriceKzte,
                    averagePricePerShare: Math.floor(params.totalPriceKzte / params.shareAmount),
                    lastPurchaseTx: null,
                    status: 'ACTIVE',
                },
            });
            return;
        }
        const newShares = buyerPosition.totalSharesPurchased + params.shareAmount;
        const newTotalSpent = buyerPosition.totalKzteSpent + params.totalPriceKzte;
        await this.prisma.energyInvestorPosition.update({
            where: { id: buyerPosition.id },
            data: {
                assetId: params.assetId,
                assetPda: params.assetPda,
                shareMintAddress: params.shareMintAddress,
                buyerWalletAddress: params.buyerWalletAddress,
                buyerKzteAccount: params.buyerKzteAccount,
                buyerShareAccount: params.buyerShareAccount,
                totalSharesPurchased: newShares,
                totalKzteSpent: newTotalSpent,
                averagePricePerShare: Math.floor(newTotalSpent / newShares),
                status: 'ACTIVE',
            },
        });
    }
};
exports.OtcService = OtcService;
exports.OtcService = OtcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        anchor_service_1.AnchorService,
        solana_service_1.SolanaService])
], OtcService);
//# sourceMappingURL=otc.service.js.map