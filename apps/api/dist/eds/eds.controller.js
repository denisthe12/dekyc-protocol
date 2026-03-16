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
exports.EdsController = void 0;
const common_1 = require("@nestjs/common");
const eds_service_1 = require("./eds.service");
const attest_signature_dto_1 = require("./dto/attest-signature.dto");
const save_analysis_dto_1 = require("./dto/save-analysis.dto");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let EdsController = class EdsController {
    edsService;
    constructor(edsService) {
        this.edsService = edsService;
    }
    health() {
        return {
            ok: true,
            service: 'eds',
            timestamp: new Date().toISOString(),
        };
    }
    createChallenge() {
        return this.edsService.createChallenge();
    }
    attest(body, req) {
        return this.edsService.attestSignature(body, req.user.sub);
    }
    analyze(body) {
        return this.edsService.saveAnalysis(body);
    }
};
exports.EdsController = EdsController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EdsController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('challenge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EdsController.prototype, "createChallenge", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('attest'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attest_signature_dto_1.AttestSignatureDto, Object]),
    __metadata("design:returntype", void 0)
], EdsController.prototype, "attest", null);
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_analysis_dto_1.SaveAnalysisDto]),
    __metadata("design:returntype", void 0)
], EdsController.prototype, "analyze", null);
exports.EdsController = EdsController = __decorate([
    (0, common_1.Controller)('eds'),
    __metadata("design:paramtypes", [eds_service_1.EdsService])
], EdsController);
//# sourceMappingURL=eds.controller.js.map