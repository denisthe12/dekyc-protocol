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
exports.EnergyPointsService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const solana_service_1 = require("./solana.service");
const solana_constants_1 = require("./solana.constants");
let EnergyPointsService = class EnergyPointsService {
    constructor(solanaService) {
        this.solanaService = solanaService;
    }
    async getEnergyPointsMintStatus() {
        const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            return {
                exists: false,
                mintAddress: null,
                decimals: null,
                supply: null,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
            };
        }
        const connection = this.solanaService.getConnection();
        const mint = await (0, spl_token_1.getMint)(connection, new web3_js_1.PublicKey(mintAddress), 'confirmed', spl_token_1.TOKEN_2022_PROGRAM_ID);
        return {
            exists: true,
            mintAddress,
            decimals: mint.decimals,
            supply: mint.supply.toString(),
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
        };
    }
    async createEnergyPointsMint() {
        const existingMintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
        if (existingMintAddress) {
            return {
                mintAddress: existingMintAddress,
                decimals: Number(process.env.ENERGY_POINTS_DECIMALS ?? solana_constants_1.DEFAULT_ENERGY_POINTS_DECIMALS),
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
            };
        }
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        const decimals = Number(process.env.ENERGY_POINTS_DECIMALS ?? solana_constants_1.DEFAULT_ENERGY_POINTS_DECIMALS);
        const mintPublicKey = await (0, spl_token_1.createMint)(connection, signer, signer.publicKey, signer.publicKey, decimals, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return {
            mintAddress: mintPublicKey.toBase58(),
            decimals,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
        };
    }
    async ensureUserEnergyPointsAccount(userWalletAddress) {
        const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
        }
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        const owner = new web3_js_1.PublicKey(userWalletAddress);
        console.log('EnergyPoints owner on curve:', web3_js_1.PublicKey.isOnCurve(owner.toBytes()));
        console.log('EnergyPoints owner:', owner.toBase58());
        console.log('EnergyPoints mint:', mintAddress);
        const tokenAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, signer, new web3_js_1.PublicKey(mintAddress), owner, true, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return {
            tokenAccountAddress: tokenAccount.address.toBase58(),
        };
    }
    async mintEnergyPointsToUser(params) {
        const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
        }
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        const tx = await (0, spl_token_1.mintTo)(connection, signer, new web3_js_1.PublicKey(mintAddress), new web3_js_1.PublicKey(params.recipientTokenAccount), signer, params.amountBaseUnits, [], undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return { tx };
    }
    getEnergyPointsMint() {
        const mintAddress = process.env.ENERGY_POINTS_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            throw new Error('ENERGY_POINTS_MINT_ADDRESS is not configured');
        }
        return new web3_js_1.PublicKey(mintAddress);
    }
};
exports.EnergyPointsService = EnergyPointsService;
exports.EnergyPointsService = EnergyPointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [solana_service_1.SolanaService])
], EnergyPointsService);
//# sourceMappingURL=energy-points.service.js.map