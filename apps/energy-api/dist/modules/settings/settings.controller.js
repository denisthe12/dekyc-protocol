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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const set_action_password_dto_1 = require("./dto/set-action-password.dto");
const verify_action_password_dto_1 = require("./dto/verify-action-password.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getActionPasswordStatus(req) {
        return this.settingsService.getActionPasswordStatus(req.user.id);
    }
    async setActionPassword(req, dto) {
        await this.settingsService.setActionPassword({
            energyUserId: req.user.id,
            password: dto.password,
        });
        return {
            ok: true,
        };
    }
    async verifyActionPassword(req, dto) {
        return this.settingsService.verifyActionPassword({
            energyUserId: req.user.id,
            password: dto.password,
        });
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('action-password/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getActionPasswordStatus", null);
__decorate([
    (0, common_1.Post)('action-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_action_password_dto_1.SetActionPasswordDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "setActionPassword", null);
__decorate([
    (0, common_1.Post)('action-password/verify'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_action_password_dto_1.VerifyActionPasswordDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "verifyActionPassword", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map