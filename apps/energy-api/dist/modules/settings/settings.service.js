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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setActionPassword(params) {
        const passwordHash = await argon2.hash(params.password);
        const existing = await this.prisma.energyUserActionPassword.findUnique({
            where: {
                energyUserId: params.energyUserId,
            },
        });
        if (!existing) {
            return this.prisma.energyUserActionPassword.create({
                data: {
                    energyUserId: params.energyUserId,
                    passwordHash,
                },
            });
        }
        return this.prisma.energyUserActionPassword.update({
            where: {
                energyUserId: params.energyUserId,
            },
            data: {
                passwordHash,
            },
        });
    }
    async verifyActionPassword(params) {
        const record = await this.prisma.energyUserActionPassword.findUnique({
            where: {
                energyUserId: params.energyUserId,
            },
        });
        if (!record) {
            throw new common_1.UnauthorizedException('Action password is not set');
        }
        const valid = await argon2.verify(record.passwordHash, params.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid action password');
        }
        return { valid: true };
    }
    async getActionPasswordStatus(energyUserId) {
        const record = await this.prisma.energyUserActionPassword.findUnique({
            where: {
                energyUserId,
            },
            select: {
                id: true,
            },
        });
        return {
            isSet: Boolean(record),
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map