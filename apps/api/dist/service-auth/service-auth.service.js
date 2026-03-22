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
exports.ServiceAuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const service_api_service_1 = require("../service-api/service-api.service");
let ServiceAuthService = class ServiceAuthService {
    prisma;
    serviceApiService;
    constructor(prisma, serviceApiService) {
        this.prisma = prisma;
        this.serviceApiService = serviceApiService;
    }
    async login(input) {
        const normalizedUserId = input.userId.trim();
        const normalizedBiometricMockId = input.biometricMockId.trim();
        const normalizedLoginCode = input.loginCode.trim();
        if (!normalizedUserId || !normalizedBiometricMockId || !normalizedLoginCode) {
            throw new common_1.BadRequestException('userId, biometricMockId and loginCode are required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: normalizedUserId },
            select: {
                id: true,
                biometricConfigured: true,
                biometricMockId: true,
                loginCodeHash: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.biometricConfigured || !user.biometricMockId) {
            throw new common_1.UnauthorizedException('Biometric mock is not configured');
        }
        if (user.biometricMockId !== normalizedBiometricMockId) {
            throw new common_1.UnauthorizedException('Biometric mock mismatch');
        }
        if (!user.loginCodeHash) {
            throw new common_1.UnauthorizedException('Login code not configured');
        }
        const loginCodeHash = (0, crypto_1.createHash)('sha256')
            .update(normalizedLoginCode)
            .digest('hex');
        if (loginCodeHash !== user.loginCodeHash) {
            throw new common_1.UnauthorizedException('Invalid login code');
        }
        return this.serviceApiService.requestKyc({
            serviceId: input.serviceId,
            clientId: input.clientId,
            nonce: input.nonce,
            timestamp: input.timestamp,
            userId: normalizedUserId,
            requestedClaims: input.requestedClaims,
        });
    }
};
exports.ServiceAuthService = ServiceAuthService;
exports.ServiceAuthService = ServiceAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        service_api_service_1.ServiceApiService])
], ServiceAuthService);
//# sourceMappingURL=service-auth.service.js.map