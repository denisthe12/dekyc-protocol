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
exports.KycProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KycProfileService = class KycProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertKycProfile(dto) {
        const existing = await this.prisma.kycProfile.findFirst({
            where: {
                userId: dto.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const profileJson = {
            fullName: dto.fullName,
            firstName: dto.firstName,
            lastName: dto.lastName,
            middleName: dto.middleName,
            iin: dto.iin,
            email: dto.email,
            birthDate: dto.birthDate,
            gender: dto.gender,
            country: dto.country,
            source: dto.source,
            status: dto.status,
        };
        if (existing) {
            return this.prisma.kycProfile.update({
                where: { id: existing.id },
                data: {
                    fullName: dto.fullName,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    middleName: dto.middleName,
                    iin: dto.iin,
                    email: dto.email,
                    birthDate: dto.birthDate,
                    gender: dto.gender,
                    country: dto.country,
                    source: dto.source,
                    status: dto.status,
                    profileJson,
                },
            });
        }
        return this.prisma.kycProfile.create({
            data: {
                userId: dto.userId,
                fullName: dto.fullName,
                firstName: dto.firstName,
                lastName: dto.lastName,
                middleName: dto.middleName,
                iin: dto.iin,
                email: dto.email,
                birthDate: dto.birthDate,
                gender: dto.gender,
                country: dto.country,
                source: dto.source,
                status: dto.status,
                profileJson,
            },
        });
    }
    async getLatestUserKycProfile(userId) {
        return this.prisma.kycProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.KycProfileService = KycProfileService;
exports.KycProfileService = KycProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KycProfileService);
//# sourceMappingURL=kyc-profile.service.js.map