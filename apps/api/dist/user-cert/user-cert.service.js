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
exports.UserCertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserCertService = class UserCertService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveUserCert(dto) {
        if (!dto.certificateFingerprint256) {
            throw new Error('certificateFingerprint256 is required');
        }
        const existing = await this.prisma.userCert.findUnique({
            where: {
                certificateFingerprint256: dto.certificateFingerprint256,
            },
        });
        if (existing) {
            return this.prisma.userCert.update({
                where: { id: existing.id },
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
                    birthCentury: dto.birthCentury,
                    certificateSerialNumber: dto.certificateSerialNumber,
                    certificateIssuer: dto.certificateIssuer,
                    certificateSubject: dto.certificateSubject,
                    validFrom: dto.certificateValidFrom,
                    validTo: dto.certificateValidTo,
                },
            });
        }
        return this.prisma.userCert.create({
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
                birthCentury: dto.birthCentury,
                certificateSerialNumber: dto.certificateSerialNumber,
                certificateFingerprint256: dto.certificateFingerprint256,
                certificateIssuer: dto.certificateIssuer,
                certificateSubject: dto.certificateSubject,
                validFrom: dto.certificateValidFrom,
                validTo: dto.certificateValidTo,
            },
        });
    }
    async getAllUserCerts() {
        return this.prisma.userCert.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.UserCertService = UserCertService;
exports.UserCertService = UserCertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserCertService);
//# sourceMappingURL=user-cert.service.js.map