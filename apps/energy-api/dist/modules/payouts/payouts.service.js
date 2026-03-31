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
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const anchor = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const prisma_service_1 = require("../prisma/prisma.service");
const anchor_service_1 = require("../solana/anchor.service");
const solana_service_1 = require("../solana/solana.service");
let PayoutsService = class PayoutsService {
    constructor(prisma, anchorService, solanaService) {
        this.prisma = prisma;
        this.anchorService = anchorService;
        this.solanaService = solanaService;
    }
    async createRevenueEpoch(params) {
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
        const [epochPda] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('revenue_epoch'),
            assetIdAsU64.toArrayLike(Buffer, 'le', 8),
            epochIndexBn.toArrayLike(Buffer, 'le', 8),
        ], program.programId);
        const issuerKzteAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, signer, this.solanaService.getKzteMint(), signer.publicKey, false, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const tx = await program.methods
            .createRevenueEpoch(epochIndexBn, new anchor.BN(params.totalAmountKzte))
            .accounts({
            issuer: signer.publicKey,
            energyAsset: new web3_js_1.PublicKey(asset.assetPda),
            kzteMint: this.solanaService.getKzteMint(),
            treasuryKzteAccount: new web3_js_1.PublicKey(asset.treasuryKzteAccount),
            issuerKzteAccount: issuerKzteAccount.address,
            revenueEpoch: epochPda,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
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
    async claimPayout(params) {
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
        const solTopUp = await this.solanaService.ensureSolBalance(wallet.custodialWalletAddress, 0.02, 0.1);
        console.log('SOL top-up result:', solTopUp);
        const secret = wallet.custodialWalletSecretJson;
        if (!secret) {
            throw new Error('User custodial key is missing');
        }
        const claimerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret));
        const program = this.anchorService.program;
        const epochPda = new web3_js_1.PublicKey(epoch.revenueEpochPda);
        const [claimReceiptPda] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('claim_receipt'),
            epochPda.toBuffer(),
            claimerKeypair.publicKey.toBuffer(),
        ], program.programId);
        const tx = await program.methods
            .claimPayout()
            .accounts({
            claimer: claimerKeypair.publicKey,
            energyAsset: new web3_js_1.PublicKey(asset.assetPda),
            revenueEpoch: epochPda,
            kzteMint: this.solanaService.getKzteMint(),
            treasuryKzteAccount: new web3_js_1.PublicKey(asset.treasuryKzteAccount),
            claimerKzteAccount: new web3_js_1.PublicKey(wallet.kzteTokenAccountAddress ?? ''),
            claimerShareAccount: new web3_js_1.PublicKey(position.buyerShareAccount),
            claimReceipt: claimReceiptPda,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
        })
            .signers([claimerKeypair])
            .rpc();
        const claimedAmountKzte = position.totalSharesPurchased * epoch.amountPerShareKzte;
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
    async listEpochs(assetId) {
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
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        anchor_service_1.AnchorService,
        solana_service_1.SolanaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map