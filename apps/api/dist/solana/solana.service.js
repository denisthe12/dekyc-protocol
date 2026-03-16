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
exports.SolanaService = void 0;
const common_1 = require("@nestjs/common");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
const fs_2 = require("fs");
const spl_token_1 = require("@solana/spl-token");
let SolanaService = class SolanaService {
    connection;
    walletKeypair;
    provider;
    programId;
    program;
    constructor() {
        const rpcUrl = (0, env_1.getRequiredEnv)('SOLANA_RPC_URL');
        const keypairPath = (0, env_1.getRequiredEnv)('SOLANA_KEYPAIR_PATH');
        const programId = (0, env_1.getRequiredEnv)('SOLANA_PERMISSION_PROGRAM_ID');
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        const secret = JSON.parse((0, fs_1.readFileSync)(keypairPath, 'utf8'));
        this.walletKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secret));
        const wallet = new anchor_1.Wallet(this.walletKeypair);
        this.provider = new anchor_1.AnchorProvider(this.connection, wallet, {
            commitment: 'confirmed',
        });
        this.programId = new web3_js_1.PublicKey(programId);
        const idlPath = `${process.cwd()}/idl/permission_protocol.json`;
        if (!(0, fs_2.existsSync)(idlPath)) {
            throw new Error(`IDL file not found at ${idlPath}`);
        }
        const idl = JSON.parse((0, fs_1.readFileSync)(idlPath, 'utf8'));
        this.program = new anchor_1.Program(idl, this.provider);
    }
    getConnection() {
        return this.connection;
    }
    getProgramId() {
        return this.programId;
    }
    getWalletPubkey() {
        return this.walletKeypair.publicKey;
    }
    deriveUserPda(authority) {
        return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('user'), authority.toBuffer()], this.programId);
    }
    derivePermissionPda(userPda, serviceIdHash) {
        return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('permission'), userPda.toBuffer(), Buffer.from(serviceIdHash)], this.programId);
    }
    hashTo32Bytes(value) {
        return (0, crypto_1.createHash)('sha256').update(value).digest();
    }
    async registerUserOnChain(userId) {
        if (!this.program) {
            throw new Error('Program IDL is not loaded');
        }
        const authority = this.walletKeypair.publicKey;
        const [userPda] = this.deriveUserPda(authority);
        const userIdHash = this.hashTo32Bytes(userId);
        const tx = await this.program.methods
            .registerUser(Array.from(userIdHash))
            .accounts({
            authority,
            userPda,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return {
            tx,
            userPda: userPda.toBase58(),
        };
    }
    async grantPermissionOnChain(params) {
        if (!this.program) {
            throw new Error('Program IDL is not loaded');
        }
        const authority = this.walletKeypair.publicKey;
        const [userPda] = this.deriveUserPda(authority);
        const serviceIdHash = this.hashTo32Bytes(params.serviceId);
        const kycHash32 = this.hashTo32Bytes(params.kycHash);
        const [permissionPda] = this.derivePermissionPda(userPda, serviceIdHash);
        const mintPubkey = new web3_js_1.PublicKey(params.mint);
        const tokenAccountPubkey = new web3_js_1.PublicKey(params.tokenAccount);
        const tx = await this.program.methods
            .grantPermission(Array.from(serviceIdHash), Array.from(kycHash32), new anchor_1.BN(params.requiredAmount), mintPubkey, tokenAccountPubkey, spl_token_1.TOKEN_2022_PROGRAM_ID)
            .accounts({
            authority,
            userPda,
            permissionPda,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return {
            tx,
            userPda: userPda.toBase58(),
            permissionPda: permissionPda.toBase58(),
            mint: mintPubkey.toBase58(),
            tokenAccount: tokenAccountPubkey.toBase58(),
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(),
        };
    }
    async revokePermissionOnChain(serviceId) {
        if (!this.program) {
            throw new Error('Program IDL is not loaded');
        }
        const authority = this.walletKeypair.publicKey;
        const [userPda] = this.deriveUserPda(authority);
        const serviceIdHash = this.hashTo32Bytes(serviceId);
        const [permissionPda] = this.derivePermissionPda(userPda, serviceIdHash);
        const tx = await this.program.methods
            .revokePermission()
            .accounts({
            authority,
            userPda,
            permissionPda,
        })
            .rpc();
        return {
            tx,
            permissionPda: permissionPda.toBase58(),
        };
    }
};
exports.SolanaService = SolanaService;
exports.SolanaService = SolanaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SolanaService);
//# sourceMappingURL=solana.service.js.map