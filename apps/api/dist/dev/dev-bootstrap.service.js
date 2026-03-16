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
exports.DevBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DevBootstrapService = class DevBootstrapService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const existing = await this.prisma.user.findUnique({
            where: { email: 'demo@dekyc.local' },
        });
        if (!existing) {
            await this.prisma.user.create({
                data: {
                    email: 'demo@dekyc.local',
                    passwordHash: 'dev-placeholder-hash',
                    emailVerified: true,
                },
            });
        }
    }
};
exports.DevBootstrapService = DevBootstrapService;
exports.DevBootstrapService = DevBootstrapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevBootstrapService);
//# sourceMappingURL=dev-bootstrap.service.js.map