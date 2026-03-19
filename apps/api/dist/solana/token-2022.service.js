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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const crypto_1 = require("crypto");
const solana_service_1 = require("./solana.service");
const spl_token_2 = require("@solana/spl-token");
let Token2022Service = class Token2022Service {
    solanaService;
    constructor(solanaService) {
        this.solanaService = solanaService;
    }
    get connection() {
        return this.solanaService.getConnection();
    }
    get payer() {
        return this.solanaService.getWalletKeypair();
    }
    deriveDeterministicScopeMint(serviceId, scope) {
        const seed = (0, crypto_1.createHash)('sha256')
            .update(`scope-mint:${serviceId}:${scope}`)
            .digest();
        return web3_js_1.Keypair.fromSeed(seed.subarray(0, 32));
    }
    deriveServiceScopeTokenAccount(serviceOwner, mint) {
        return (0, spl_token_1.getAssociatedTokenAddressSync)(mint, serviceOwner, false, spl_token_1.TOKEN_2022_PROGRAM_ID);
    }
    async createScopeMintAndAccount(params) {
        const decimals = params.decimals ?? 0;
        const mintKeypair = this.deriveDeterministicScopeMint(params.serviceId, params.scope);
        const mintPubkey = mintKeypair.publicKey;
        const ata = this.deriveServiceScopeTokenAccount(params.serviceOwner, mintPubkey);
        const tx = new web3_js_1.Transaction();
        const mintInfo = await this.connection.getAccountInfo(mintPubkey);
        if (!mintInfo) {
            const lamports = await this.connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
            tx.add(web3_js_1.SystemProgram.createAccount({
                fromPubkey: this.payer.publicKey,
                newAccountPubkey: mintPubkey,
                space: spl_token_1.MINT_SIZE,
                lamports,
                programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
            }), (0, spl_token_1.createInitializeMint2Instruction)(mintPubkey, decimals, this.payer.publicKey, this.payer.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID));
        }
        const ataInfo = await this.connection.getAccountInfo(ata);
        if (!ataInfo) {
            tx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(this.payer.publicKey, ata, params.serviceOwner, mintPubkey, spl_token_1.TOKEN_2022_PROGRAM_ID));
        }
        let signature = null;
        if (tx.instructions.length > 0) {
            signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, tx, [this.payer, mintKeypair], { commitment: 'confirmed' });
        }
        return {
            mint: mintPubkey.toBase58(),
            tokenAccount: ata.toBase58(),
            initTx: signature,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
        };
    }
    async mintScopeTokens(params) {
        const mint = new web3_js_1.PublicKey(params.mint);
        const tokenAccount = new web3_js_1.PublicKey(params.tokenAccount);
        const tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, this.payer.publicKey, BigInt(params.amount), [], spl_token_1.TOKEN_2022_PROGRAM_ID));
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, tx, [this.payer], { commitment: 'confirmed' });
        return { tx: signature };
    }
    async burnScopeTokens(params) {
        const mint = new web3_js_1.PublicKey(params.mint);
        const tokenAccount = new web3_js_1.PublicKey(params.tokenAccount);
        const tx = new web3_js_1.Transaction().add((0, spl_token_1.createBurnInstruction)(tokenAccount, mint, this.payer.publicKey, BigInt(params.amount), [], spl_token_1.TOKEN_2022_PROGRAM_ID));
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, tx, [this.payer], { commitment: 'confirmed' });
        return { tx: signature };
    }
    async getScopeTokenBalance(tokenAccountAddress) {
        const tokenAccount = new web3_js_1.PublicKey(tokenAccountAddress);
        const account = await (0, spl_token_2.getAccount)(this.connection, tokenAccount, 'confirmed', spl_token_1.TOKEN_2022_PROGRAM_ID);
        return Number(account.amount);
    }
};
exports.Token2022Service = Token2022Service;
exports.Token2022Service = Token2022Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [solana_service_1.SolanaService])
], Token2022Service);
//# sourceMappingURL=token-2022.service.js.map