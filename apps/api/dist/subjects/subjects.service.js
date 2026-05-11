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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subject_id_service_1 = require("./subject-id.service");
let SubjectsService = class SubjectsService {
    prisma;
    subjectIdService;
    constructor(prisma, subjectIdService) {
        this.prisma = prisma;
        this.subjectIdService = subjectIdService;
    }
    async ensureSubjectForUser(userId) {
        const existingSubject = await this.prisma.deKycSubject.findUnique({
            where: {
                userId,
            },
        });
        if (existingSubject) {
            return existingSubject;
        }
        try {
            return await this.prisma.deKycSubject.create({
                data: {
                    userId,
                    subjectId: this.subjectIdService.generateSubjectId(userId),
                },
            });
        }
        catch (error) {
            if (!this.isUniqueConstraintError(error)) {
                throw error;
            }
            const racedSubject = await this.prisma.deKycSubject.findUnique({
                where: {
                    userId,
                },
            });
            if (!racedSubject) {
                throw error;
            }
            return racedSubject;
        }
    }
    async ensureServiceSubject(input) {
        const subject = await this.ensureSubjectForUser(input.userId);
        const existingServiceSubject = await this.prisma.deKycServiceSubject.findUnique({
            where: {
                userId_serviceId: {
                    userId: input.userId,
                    serviceId: input.serviceId,
                },
            },
        });
        if (existingServiceSubject) {
            return existingServiceSubject;
        }
        try {
            return await this.prisma.deKycServiceSubject.create({
                data: {
                    userId: input.userId,
                    serviceId: input.serviceId,
                    subjectId: subject.subjectId,
                    serviceSubjectId: this.subjectIdService.generateServiceSubjectId({
                        userId: input.userId,
                        serviceId: input.serviceId,
                        subjectId: subject.subjectId,
                    }),
                },
            });
        }
        catch (error) {
            if (!this.isUniqueConstraintError(error)) {
                throw error;
            }
            const racedServiceSubject = await this.prisma.deKycServiceSubject.findUnique({
                where: {
                    userId_serviceId: {
                        userId: input.userId,
                        serviceId: input.serviceId,
                    },
                },
            });
            if (!racedServiceSubject) {
                throw error;
            }
            return racedServiceSubject;
        }
    }
    async findSubjectByUserId(userId) {
        return this.prisma.deKycSubject.findUnique({
            where: {
                userId,
            },
        });
    }
    async findServiceSubject(input) {
        return this.prisma.deKycServiceSubject.findUnique({
            where: {
                userId_serviceId: {
                    userId: input.userId,
                    serviceId: input.serviceId,
                },
            },
        });
    }
    async listServiceSubjectsForUser(userId) {
        return this.prisma.deKycServiceSubject.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    isUniqueConstraintError(error) {
        if (typeof error !== 'object' || error === null) {
            return false;
        }
        if (!('code' in error)) {
            return false;
        }
        const errorWithCode = error;
        return errorWithCode.code === 'P2002';
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subject_id_service_1.SubjectIdService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map