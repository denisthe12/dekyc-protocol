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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dto/signup.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const hkdf_service_1 = require("../crypto/hkdf.service");
const solana_service_1 = require("../solana/solana.service");
const setup_biometric_dto_1 = require("./dto/setup-biometric.dto");
let AuthController = class AuthController {
    authService;
    hkdfService;
    solanaService;
    constructor(authService, hkdfService, solanaService) {
        this.authService = authService;
        this.hkdfService = hkdfService;
        this.solanaService = solanaService;
    }
    signup(body) {
        return this.authService.signup(body);
    }
    login(body) {
        return this.authService.login(body);
    }
    me(req) {
        return this.authService.getMe(req.user.sub);
    }
    testHkdf() {
        const key = this.hkdfService.derivePermissionKey({
            permissionId: 'perm-test',
            serviceId: 'service-test',
            userId: 'user-test',
        });
        return {
            permissionKey: key,
        };
    }
    solanaDebug() {
        return {
            programId: this.solanaService.getProgramId().toBase58(),
            wallet: this.solanaService.getWalletPubkey().toBase58(),
        };
    }
    async solanaRegisterUser(req) {
        const userId = req.user.sub;
        const result = await this.solanaService.registerUserOnChain(userId);
        return {
            message: 'User registered on-chain',
            ...result,
        };
    }
    profileSummary(req) {
        return this.authService.getProfileSummary(req.user.sub);
    }
    setupBiometric(req, body) {
        return this.authService.setupBiometric(req.user.sub, body.biometricMockId);
    }
    issueLoginCode(req) {
        return this.authService.issueLoginCode(req.user.sub);
    }
    rotateLoginCode(req) {
        return this.authService.rotateLoginCode(req.user.sub);
    }
    kycSummary(req) {
        return this.authService.getKycSummary(req.user.sub);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('test-hkdf'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "testHkdf", null);
__decorate([
    (0, common_1.Get)('solana-debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "solanaDebug", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('solana-register-user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "solanaRegisterUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profileSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('biometric/setup'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, setup_biometric_dto_1.SetupBiometricDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setupBiometric", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('login-code/issue'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "issueLoginCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('login-code/rotate'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "rotateLoginCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('kyc-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "kycSummary", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        hkdf_service_1.HkdfService,
        solana_service_1.SolanaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map