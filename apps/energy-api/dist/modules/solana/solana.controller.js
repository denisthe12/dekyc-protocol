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
exports.SolanaController = void 0;
const common_1 = require("@nestjs/common");
const solana_service_1 = require("./solana.service");
const token_2022_service_1 = require("./token-2022.service");
let SolanaController = class SolanaController {
    constructor(solanaService, token2022Service) {
        this.solanaService = solanaService;
        this.token2022Service = token2022Service;
    }
    async getStatus() {
        const signer = await this.solanaService.getSignerStatus();
        const kzte = await this.token2022Service.getKzteMintStatus();
        return {
            rpcUrl: signer.rpcUrl,
            signerAddress: signer.signerAddress,
            signerBalanceSol: signer.signerBalanceSol,
            kzte,
        };
    }
    async createKzteMint() {
        return this.token2022Service.createKzteMint();
    }
};
exports.SolanaController = SolanaController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SolanaController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('kzte/init'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SolanaController.prototype, "createKzteMint", null);
exports.SolanaController = SolanaController = __decorate([
    (0, common_1.Controller)('solana'),
    __metadata("design:paramtypes", [solana_service_1.SolanaService,
        token_2022_service_1.Token2022Service])
], SolanaController);
//# sourceMappingURL=solana.controller.js.map