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
exports.ConnectVerificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const connect_verification_service_1 = require("./connect-verification.service");
let ConnectVerificationController = class ConnectVerificationController {
    connectVerificationService;
    constructor(connectVerificationService) {
        this.connectVerificationService = connectVerificationService;
    }
    getSnapshot() {
        return this.connectVerificationService.getSnapshot();
    }
};
exports.ConnectVerificationController = ConnectVerificationController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('snapshot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConnectVerificationController.prototype, "getSnapshot", null);
exports.ConnectVerificationController = ConnectVerificationController = __decorate([
    (0, common_1.Controller)('connect-verification'),
    __metadata("design:paramtypes", [connect_verification_service_1.ConnectVerificationService])
], ConnectVerificationController);
//# sourceMappingURL=connect-verification.controller.js.map