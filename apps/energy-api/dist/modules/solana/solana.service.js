"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = require("path");
const web3_js_1 = require("@solana/web3.js");
let SolanaService = class SolanaService {
    constructor() {
        this.connection = null;
        this.signer = null;
    }
    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        const rpcUrl = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        return this.connection;
    }
    async getSigner() {
        if (this.signer) {
            return this.signer;
        }
        const keypairPath = process.env.SOLANA_SIGNER_KEYPAIR_PATH;
        if (!keypairPath) {
            throw new Error('SOLANA_SIGNER_KEYPAIR_PATH is not configured');
        }
        const resolvedPath = path.resolve(process.cwd(), keypairPath);
        const raw = await fs_1.promises.readFile(resolvedPath, 'utf-8');
        const secret = JSON.parse(raw);
        if (!Array.isArray(secret) || secret.length === 0) {
            throw new Error('Invalid signer keypair file');
        }
        this.signer = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secret));
        return this.signer;
    }
    getProgramId() {
        const value = process.env.TOKENIZATION_PROGRAM_ID?.trim();
        if (!value) {
            throw new Error('TOKENIZATION_PROGRAM_ID is not configured');
        }
        return new web3_js_1.PublicKey(value);
    }
    getKzteMint() {
        const value = process.env.KZTE_MINT_ADDRESS?.trim();
        if (!value) {
            throw new Error('KZTE_MINT_ADDRESS is not configured');
        }
        return new web3_js_1.PublicKey(value);
    }
    async getSignerStatus() {
        const connection = this.getConnection();
        const signer = await this.getSigner();
        const balanceLamports = await connection.getBalance(signer.publicKey, 'confirmed');
        return {
            rpcUrl: connection.rpcEndpoint,
            signerAddress: signer.publicKey.toBase58(),
            signerBalanceSol: balanceLamports / web3_js_1.LAMPORTS_PER_SOL,
        };
    }
    async buildTransferTx(from, to, lamports) {
        const tx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports,
        }));
        tx.feePayer = from;
        tx.recentBlockhash = (await this.getConnection().getLatestBlockhash('confirmed')).blockhash;
        return tx;
    }
    async ensureSolBalance(wallet, minSol = 0.02, topUpSol = 0.1) {
        const connection = this.getConnection();
        const signer = await this.getSigner();
        const pubkey = new web3_js_1.PublicKey(wallet);
        const balanceLamports = await connection.getBalance(pubkey, 'confirmed');
        const balanceSol = balanceLamports / web3_js_1.LAMPORTS_PER_SOL;
        if (balanceSol >= minSol) {
            return {
                toppedUp: false,
                balanceBefore: balanceSol,
                balanceAfter: balanceSol,
            };
        }
        const lamports = Math.floor(topUpSol * web3_js_1.LAMPORTS_PER_SOL);
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(connection, await this.buildTransferTx(signer.publicKey, pubkey, lamports), [signer], {
            commitment: 'confirmed',
            skipPreflight: false,
        });
        const targetLamports = Math.floor(minSol * web3_js_1.LAMPORTS_PER_SOL);
        let newBalanceLamports = 0;
        let attempts = 0;
        while (attempts < 10) {
            newBalanceLamports = await connection.getBalance(pubkey, 'confirmed');
            if (newBalanceLamports >= targetLamports) {
                return {
                    toppedUp: true,
                    balanceBefore: balanceSol,
                    balanceAfter: newBalanceLamports / web3_js_1.LAMPORTS_PER_SOL,
                    tx: signature,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 700));
            attempts += 1;
        }
        throw new Error(`SOL top-up transaction confirmed but balance is still below minimum. tx=${signature}`);
    }
};
exports.SolanaService = SolanaService;
exports.SolanaService = SolanaService = __decorate([
    (0, common_1.Injectable)()
], SolanaService);
//# sourceMappingURL=solana.service.js.map