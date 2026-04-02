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
exports.EnergyBlockchainService = void 0;
const common_1 = require("@nestjs/common");
const anchor = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const anchor_service_1 = require("../solana/anchor.service");
const solana_service_1 = require("../solana/solana.service");
const hash_util_1 = require("./utils/hash.util");
const metadata_util_1 = require("./utils/metadata.util");
const prisma_service_1 = require("../prisma/prisma.service");
const positions_service_1 = require("../positions/positions.service");
let EnergyBlockchainService = class EnergyBlockchainService {
    constructor(anchorService, solanaService, prisma, positionsService) {
        this.anchorService = anchorService;
        this.solanaService = solanaService;
        this.prisma = prisma;
        this.positionsService = positionsService;
    }
    async getRegistryPda() {
        const program = this.anchorService.program;
        const [registryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('registry')], program.programId);
        return registryPda;
    }
    async createRegistryIfNeeded() {
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
    async createEnergyAsset() {
        const provider = this.anchorService.provider;
        const program = this.anchorService.program;
        const signer = await this.solanaService.getSigner();
        const registry = await this.createRegistryIfNeeded();
        const assetIdBn = new anchor.BN(Date.now());
        const assetIdLe = assetIdBn.toArrayLike(Buffer, 'le', 8);
        const [assetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('energy_asset'), assetIdLe], program.programId);
        const shareMint = await (0, spl_token_1.createMint)(provider.connection, signer, assetPda, null, 0, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const treasuryShareAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, signer, shareMint, assetPda, true, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const treasuryKzteAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, signer, this.solanaService.getKzteMint(), assetPda, true, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const metadata = (0, metadata_util_1.buildEnergyMetadata)({
            assetId: assetIdBn.toString(),
        });
        const metadataHashBuffer = (0, hash_util_1.sha256FromObject)(metadata);
        const metadataUriHash = Array.from(metadataHashBuffer);
        const proofRootHash = new Array(32).fill(0);
        const createAssetTx = await program.methods
            .createEnergyAsset(assetIdBn, new anchor.BN(1000), new anchor.BN(10000), 8000, 2000, { kzte: {} }, proofRootHash, metadataUriHash)
            .accounts({
            issuer: provider.wallet.publicKey,
            registry: new web3_js_1.PublicKey(registry.registryPda),
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
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
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
    async buyDemoShares(params) {
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
        const secret = wallet.custodialWalletSecretJson;
        if (!secret) {
            throw new Error('User custodial key is missing');
        }
        const buyerKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret));
        const buyerShareAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, backendSigner, new web3_js_1.PublicKey(asset.shareMintAddress), buyerKeypair.publicKey, false, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const tx = await program.methods
            .buyShares(new anchor.BN(params.shareAmount), params.payoutMode === 'KZTE' ? { kzte: {} } : { energyPoints: {} })
            .accounts({
            buyer: buyerKeypair.publicKey,
            energyAsset: new web3_js_1.PublicKey(asset.assetPda),
            kzteMint: this.solanaService.getKzteMint(),
            shareMint: new web3_js_1.PublicKey(asset.shareMintAddress),
            treasuryKzteAccount: new web3_js_1.PublicKey(asset.treasuryKzteAccount),
            treasuryShareAccount: new web3_js_1.PublicKey(asset.treasuryShareAccount),
            buyerKzteAccount: new web3_js_1.PublicKey(wallet.kzteTokenAccountAddress ?? ''),
            buyerShareAccount: buyerShareAccount.address,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
            investorPosition: web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from('investor_position'),
                new web3_js_1.PublicKey(asset.assetPda).toBuffer(),
                buyerKeypair.publicKey.toBuffer(),
                params.payoutMode === 'KZTE' ? Buffer.from([0]) : Buffer.from([1]),
            ], program.programId)[0],
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
    async getInvestorPosition(params) {
        const program = this.anchorService.program;
        const [investorPositionPda] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('investor_position'),
            new web3_js_1.PublicKey(params.assetPda).toBuffer(),
            new web3_js_1.PublicKey(params.investorWallet).toBuffer(),
            params.payoutMode === 'KZTE' ? Buffer.from([0]) : Buffer.from([1]),
        ], program.programId);
        const investorPosition = await program.account.investorPosition.fetchNullable(investorPositionPda);
        return {
            investorPositionPda: investorPositionPda.toBase58(),
            investorPosition,
        };
    }
};
exports.EnergyBlockchainService = EnergyBlockchainService;
exports.EnergyBlockchainService = EnergyBlockchainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [anchor_service_1.AnchorService,
        solana_service_1.SolanaService,
        prisma_service_1.PrismaService,
        positions_service_1.PositionsService])
], EnergyBlockchainService);
//# sourceMappingURL=energy-blockchain.service.js.map