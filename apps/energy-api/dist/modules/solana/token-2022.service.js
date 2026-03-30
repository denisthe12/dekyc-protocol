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
exports.Token2022Service = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const solana_constants_1 = require("./solana.constants");
const solana_service_1 = require("./solana.service");
let Token2022Service = class Token2022Service {
    constructor(solanaService) {
        this.solanaService = solanaService;
    }
    async getKzteMintStatus() {
        const mintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
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
    async createKzteMint() {
        const existingMintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
        if (existingMintAddress) {
            return {
                mintAddress: existingMintAddress,
                decimals: Number(process.env.KZTE_DECIMALS ?? solana_constants_1.DEFAULT_KZTE_DECIMALS),
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
            };
        }
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        const decimals = Number(process.env.KZTE_DECIMALS ?? solana_constants_1.DEFAULT_KZTE_DECIMALS);
        const mintPublicKey = await (0, spl_token_1.createMint)(connection, signer, signer.publicKey, signer.publicKey, decimals, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return {
            mintAddress: mintPublicKey.toBase58(),
            decimals,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
        };
    }
    async mintKzteToSigner(params) {
        const signer = await this.solanaService.getSigner();
        const connection = this.solanaService.getConnection();
        const mintAddress = process.env.KZTE_MINT_ADDRESS?.trim() ?? '';
        if (!mintAddress) {
            throw new Error('KZTE_MINT_ADDRESS is not configured');
        }
        const decimals = Number(process.env.KZTE_DECIMALS ?? solana_constants_1.DEFAULT_KZTE_DECIMALS);
        const amountKzte = params?.amountKzte ?? 1_000_000;
        const amountBaseUnits = BigInt(amountKzte) * BigInt(10 ** decimals);
        const signerKzteAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, signer, new web3_js_1.PublicKey(mintAddress), signer.publicKey, false, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const tx = await (0, spl_token_1.mintTo)(connection, signer, new web3_js_1.PublicKey(mintAddress), signerKzteAccount.address, signer, amountBaseUnits, [], undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return {
            signerAddress: signer.publicKey.toBase58(),
            signerKzteAccount: signerKzteAccount.address.toBase58(),
            amountKzte,
            amountBaseUnits: amountBaseUnits.toString(),
            tx,
        };
    }
};
exports.Token2022Service = Token2022Service;
exports.Token2022Service = Token2022Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [solana_service_1.SolanaService])
], Token2022Service);
//# sourceMappingURL=token-2022.service.js.map