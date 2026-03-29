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
var AnchorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorService = void 0;
const common_1 = require("@nestjs/common");
const anchor = require("@coral-xyz/anchor");
const solana_service_1 = require("./solana.service");
let AnchorService = AnchorService_1 = class AnchorService {
    constructor(solanaService) {
        this.solanaService = solanaService;
        const wallet = new anchor.Wallet(undefined);
        void wallet;
        throw new Error('AnchorService must be initialized through static create(). Use AnchorServiceFactory pattern.');
    }
    static async create(solanaService) {
        const signer = await solanaService.getSigner();
        const wallet = new anchor.Wallet(signer);
        const provider = new anchor.AnchorProvider(solanaService.getConnection(), wallet, { commitment: 'confirmed' });
        anchor.setProvider(provider);
        const idl = require('../../../idl/tokenization_case.json');
        const program = new anchor.Program(idl, provider);
        const instance = Object.create(AnchorService_1.prototype);
        Object.defineProperty(instance, 'provider', { value: provider });
        Object.defineProperty(instance, 'program', { value: program });
        Object.defineProperty(instance, 'solanaService', { value: solanaService });
        return instance;
    }
};
exports.AnchorService = AnchorService;
exports.AnchorService = AnchorService = AnchorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [solana_service_1.SolanaService])
], AnchorService);
//# sourceMappingURL=anchor.service.js.map