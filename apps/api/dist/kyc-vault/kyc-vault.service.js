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
exports.KycVaultService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../crypto/crypto.service");
let KycVaultService = class KycVaultService {
    prisma;
    cryptoService;
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    async saveVaultEntry(input) {
        const kycHash = this.cryptoService.computeKycHash(input.profileJson);
        const encrypted = this.cryptoService.encryptJson(input.profileJson);
        const existing = await this.prisma.kycVaultEntry.findFirst({
            where: {
                kycProfileId: input.kycProfileId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (existing) {
            return this.prisma.kycVaultEntry.update({
                where: { id: existing.id },
                data: {
                    userId: input.userId,
                    kycProfileId: input.kycProfileId,
                    kycHash,
                    cipherText: encrypted.cipherText,
                    iv: encrypted.iv,
                    authTag: encrypted.authTag,
                    keyVersion: encrypted.keyVersion,
                    algorithm: encrypted.algorithm,
                },
            });
        }
        return this.prisma.kycVaultEntry.create({
            data: {
                userId: input.userId,
                kycProfileId: input.kycProfileId,
                kycHash,
                cipherText: encrypted.cipherText,
                iv: encrypted.iv,
                authTag: encrypted.authTag,
                keyVersion: encrypted.keyVersion,
                algorithm: encrypted.algorithm,
            },
        });
    }
};
exports.KycVaultService = KycVaultService;
exports.KycVaultService = KycVaultService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], KycVaultService);
//# sourceMappingURL=kyc-vault.service.js.map