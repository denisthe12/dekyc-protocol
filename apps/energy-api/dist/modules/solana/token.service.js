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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const spl_token_1 = require("@solana/spl-token");
const solana_service_1 = require("./solana.service");
let TokenService = class TokenService {
    constructor(solanaService) {
        this.solanaService = solanaService;
    }
    async createShareMint(authority) {
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        return (0, spl_token_1.createMint)(connection, signer, authority, null, 0, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    }
    async createTreasuryAccount(params) {
        const connection = this.solanaService.getConnection();
        const signer = await this.solanaService.getSigner();
        return (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, signer, params.mint, params.owner, true, undefined, undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [solana_service_1.SolanaService])
], TokenService);
//# sourceMappingURL=token.service.js.map