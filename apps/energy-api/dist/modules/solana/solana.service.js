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
const solana_constants_1 = require("./solana.constants");
let SolanaService = class SolanaService {
    constructor() {
        this.connection = null;
        this.signer = null;
    }
    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        const rpcUrl = process.env.SOLANA_RPC_URL ?? solana_constants_1.DEFAULT_SOLANA_RPC_URL;
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
    async getSignerPublicKey() {
        const signer = await this.getSigner();
        return signer.publicKey;
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
};
exports.SolanaService = SolanaService;
exports.SolanaService = SolanaService = __decorate([
    (0, common_1.Injectable)()
], SolanaService);
//# sourceMappingURL=solana.service.js.map