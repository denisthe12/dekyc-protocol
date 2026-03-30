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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const payouts_service_1 = require("./payouts.service");
const create_revenue_epoch_dto_1 = require("./dto/create-revenue-epoch.dto");
const claim_payout_dto_1 = require("./dto/claim-payout.dto");
let PayoutsController = class PayoutsController {
    constructor(payoutsService) {
        this.payoutsService = payoutsService;
    }
    async createEpoch(dto) {
        return this.payoutsService.createRevenueEpoch(dto);
    }
    async claim(dto) {
        return this.payoutsService.claimPayout(dto);
    }
    async listEpochs(assetId) {
        return this.payoutsService.listEpochs(assetId);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Post)('create-epoch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_revenue_epoch_dto_1.CreateRevenueEpochDto]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "createEpoch", null);
__decorate([
    (0, common_1.Post)('claim'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [claim_payout_dto_1.ClaimPayoutDto]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "claim", null);
__decorate([
    (0, common_1.Get)('epochs/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "listEpochs", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payouts'),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map