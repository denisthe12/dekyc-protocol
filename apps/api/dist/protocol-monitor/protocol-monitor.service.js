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
exports.ProtocolMonitorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProtocolMonitorService = class ProtocolMonitorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSnapshot() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        clientId: true,
                        status: true,
                    },
                },
                scopeGrants: {
                    where: {
                        revokedAt: null,
                    },
                    orderBy: {
                        scope: 'asc',
                    },
                },
            },
        });
        const accessLogs = await this.prisma.accessLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        clientId: true,
                    },
                },
                permission: {
                    select: {
                        id: true,
                        status: true,
                        onchainPermissionPda: true,
                    },
                },
            },
        });
        return {
            permissions,
            accessLogs,
        };
    }
};
exports.ProtocolMonitorService = ProtocolMonitorService;
exports.ProtocolMonitorService = ProtocolMonitorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProtocolMonitorService);
//# sourceMappingURL=protocol-monitor.service.js.map