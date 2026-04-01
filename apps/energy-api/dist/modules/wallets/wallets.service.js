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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const prisma_service_1 = require("../prisma/prisma.service");
const solana_service_1 = require("../solana/solana.service");
const energy_points_service_1 = require("../solana/energy-points.service");
let WalletsService = class WalletsService {
    constructor(prisma, solanaService, energyPointsService) {
        this.prisma = prisma;
        this.solanaService = solanaService;
        this.energyPointsService = energyPointsService;
    }
    async ensureUserWallet(params) {
        console.log('WalletsService prisma exists:', !!this.prisma);
        console.log('WalletsService solanaService exists:', !!this.solanaService);
        console.log('WalletsService energyPointsService exists:', !!this.energyPointsService);
        const existing = await this.prisma.energyUserWallet.findUnique({
            where: {
                energyUserId: params.energyUserId,
            },
        });
        if (existing?.custodialWalletSecretJson &&
            existing.kzteTokenAccountAddress &&
            existing.energyPointsTokenAccountAddress) {
            return;
        }
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        const mintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            throw new Error('KZTE_MINT_ADDRESS is not configured');
        }
        let userSecretJson;
        let walletAddress;
        let userKeypair;
        if (existing?.custodialWalletSecretJson) {
            const secretArray = existing.custodialWalletSecretJson;
            userKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secretArray));
            walletAddress = userKeypair.publicKey.toBase58();
            userSecretJson = existing.custodialWalletSecretJson;
        }
        else {
            userKeypair = web3_js_1.Keypair.generate();
            walletAddress = userKeypair.publicKey.toBase58();
            userSecretJson = Array.from(userKeypair.secretKey);
        }
        const kzteTokenAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, signer, new (await Promise.resolve().then(() => require('@solana/web3.js'))).PublicKey(mintAddress), userKeypair.publicKey, false, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const energyPointsAccount = await this.energyPointsService.ensureUserEnergyPointsAccount(walletAddress);
        let mintTx = existing?.initialKzteAirdropTx ?? null;
        if (!existing?.initialKzteAirdropped) {
            const oneMillionKzteBaseUnits = BigInt(1000000 * 100);
            mintTx = await (0, spl_token_1.mintTo)(connection, signer, new (await Promise.resolve().then(() => require('@solana/web3.js'))).PublicKey(mintAddress), kzteTokenAccount.address, signer, oneMillionKzteBaseUnits, [], undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        }
        await (0, spl_token_1.getAccount)(connection, kzteTokenAccount.address, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        await this.prisma.energyUserWallet.upsert({
            where: {
                energyUserId: params.energyUserId,
            },
            update: {
                custodialWalletAddress: walletAddress,
                custodialWalletSecretJson: userSecretJson,
                kzteTokenAccountAddress: kzteTokenAccount.address.toBase58(),
                energyPointsTokenAccountAddress: energyPointsAccount.tokenAccountAddress,
                walletStatus: 'ACTIVE',
                initialKzteAirdropped: true,
                initialKzteAirdropTx: mintTx,
            },
            create: {
                energyUserId: params.energyUserId,
                custodialWalletAddress: walletAddress,
                custodialWalletSecretJson: userSecretJson,
                kzteTokenAccountAddress: kzteTokenAccount.address.toBase58(),
                energyPointsTokenAccountAddress: energyPointsAccount.tokenAccountAddress,
                walletStatus: 'ACTIVE',
                initialKzteAirdropped: true,
                initialKzteAirdropTx: mintTx,
            },
        });
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        solana_service_1.SolanaService,
        energy_points_service_1.EnergyPointsService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map