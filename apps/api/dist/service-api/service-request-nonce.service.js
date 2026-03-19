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
exports.ServiceRequestNonceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServiceRequestNonceService = class ServiceRequestNonceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertNonceUnusedAndStore(serviceId, nonce) {
        const normalizedNonce = nonce.trim();
        if (!normalizedNonce) {
            throw new common_1.UnauthorizedException('Missing nonce');
        }
        const existing = await this.prisma.serviceRequestNonce.findUnique({
            where: {
                serviceId_nonce: {
                    serviceId,
                    nonce: normalizedNonce,
                },
            },
        });
        if (existing) {
            throw new common_1.UnauthorizedException('Replay detected: nonce already used');
        }
        await this.prisma.serviceRequestNonce.create({
            data: {
                serviceId,
                nonce: normalizedNonce,
            },
        });
    }
};
exports.ServiceRequestNonceService = ServiceRequestNonceService;
exports.ServiceRequestNonceService = ServiceRequestNonceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceRequestNonceService);
//# sourceMappingURL=service-request-nonce.service.js.map