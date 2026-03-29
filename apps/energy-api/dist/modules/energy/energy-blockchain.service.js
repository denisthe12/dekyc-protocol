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
let EnergyBlockchainService = class EnergyBlockchainService {
    constructor(anchorService, solanaService) {
        this.anchorService = anchorService;
        this.solanaService = solanaService;
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
        const proofRootHash = new Array(32).fill(0);
        const metadataUriHash = new Array(32).fill(0);
        const createAssetTx = await program.methods
            .createEnergyAsset(assetIdBn, new anchor.BN(1000), new anchor.BN(10000), 8000, 2000, { kzte: {} }, proofRootHash, metadataUriHash)
            .accounts({
            issuer: provider.wallet.publicKey,
            registry: new web3_js_1.PublicKey(registry.registryPda),
            shareMint,
            treasuryShareAccount: treasuryShareAccount.address,
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
            createAssetTx,
            issueSharesTx,
        };
    }
};
exports.EnergyBlockchainService = EnergyBlockchainService;
exports.EnergyBlockchainService = EnergyBlockchainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [anchor_service_1.AnchorService,
        solana_service_1.SolanaService])
], EnergyBlockchainService);
//# sourceMappingURL=energy-blockchain.service.js.map