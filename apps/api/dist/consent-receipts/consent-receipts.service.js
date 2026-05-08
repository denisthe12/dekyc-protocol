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
exports.ConsentReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const subjects_service_1 = require("../subjects/subjects.service");
const consent_receipts_signer_1 = require("./consent-receipts.signer");
const ACTIVE_CONSENT_STATUS = 'active';
const REVOKED_CONSENT_STATUS = 'revoked';
let ConsentReceiptsService = class ConsentReceiptsService {
    prisma;
    subjectsService;
    signer;
    constructor(prisma, subjectsService, signer) {
        this.prisma = prisma;
        this.subjectsService = subjectsService;
        this.signer = signer;
    }
    async createConsentReceipt(input) {
        const serviceSubject = await this.subjectsService.ensureServiceSubject({
            userId: input.userId,
            serviceId: input.serviceId,
        });
        const grantedAt = new Date();
        const expiresAt = input.expiresAt ?? null;
        const consentId = this.generateConsentId();
        const signablePayload = {
            consentId,
            serviceId: input.serviceId,
            subjectId: serviceSubject.subjectId,
            serviceSubjectId: serviceSubject.serviceSubjectId,
            grantedClaims: this.normalizeGrantedClaims(input.grantedClaims),
            consentTextVersion: input.consentTextVersion,
            grantedAt: grantedAt.toISOString(),
            expiresAt: expiresAt ? expiresAt.toISOString() : null,
            revokedAt: null,
            status: ACTIVE_CONSENT_STATUS,
        };
        const receiptHash = this.signer.createReceiptHash(signablePayload);
        const signature = this.signer.signReceiptHash(receiptHash);
        const receipt = await this.prisma.deKycConsentReceipt.create({
            data: {
                consentId,
                userId: input.userId,
                serviceId: input.serviceId,
                subjectId: serviceSubject.subjectId,
                serviceSubjectId: serviceSubject.serviceSubjectId,
                grantedClaims: signablePayload.grantedClaims,
                consentTextVersion: input.consentTextVersion,
                grantedAt,
                expiresAt,
                revokedAt: null,
                receiptHash,
                signature,
                status: ACTIVE_CONSENT_STATUS,
            },
        });
        return this.toReceiptDto(receipt);
    }
    async getConsentStatus(input) {
        const receipt = await this.findReceiptOwnedByServiceOrThrow(input);
        return this.toConsentStatusDto(receipt);
    }
    async listConsentsForServiceSubject(input) {
        const receipts = await this.prisma.deKycConsentReceipt.findMany({
            where: {
                serviceSubjectId: input.serviceSubjectId,
                serviceId: input.serviceId,
            },
            orderBy: {
                grantedAt: 'desc',
            },
        });
        return receipts.map((receipt) => this.toConsentStatusDto(receipt));
    }
    async revokeConsent(input) {
        const receipt = await this.findReceiptOwnedByServiceOrThrow({
            consentId: input.consentId,
            serviceId: input.serviceId,
        });
        if (receipt.status === REVOKED_CONSENT_STATUS && receipt.revokedAt) {
            return {
                consentId: receipt.consentId,
                status: REVOKED_CONSENT_STATUS,
                revokedAt: receipt.revokedAt.toISOString(),
            };
        }
        const revokedAt = new Date();
        const updatedReceipt = await this.prisma.deKycConsentReceipt.update({
            where: {
                consentId: input.consentId,
            },
            data: {
                status: REVOKED_CONSENT_STATUS,
                revokedAt,
            },
        });
        return {
            consentId: updatedReceipt.consentId,
            status: REVOKED_CONSENT_STATUS,
            revokedAt: revokedAt.toISOString(),
        };
    }
    async findReceiptOwnedByServiceOrThrow(input) {
        const receipt = await this.prisma.deKycConsentReceipt.findUnique({
            where: {
                consentId: input.consentId,
            },
        });
        if (!receipt) {
            throw new common_1.NotFoundException('Consent receipt not found');
        }
        if (receipt.serviceId !== input.serviceId) {
            throw new common_1.ForbiddenException('Consent receipt belongs to another service');
        }
        return receipt;
    }
    toReceiptDto(receipt) {
        return {
            consentId: receipt.consentId,
            serviceId: receipt.serviceId,
            subjectId: receipt.subjectId,
            serviceSubjectId: receipt.serviceSubjectId,
            grantedClaims: this.readGrantedClaims(receipt.grantedClaims),
            consentTextVersion: receipt.consentTextVersion,
            grantedAt: receipt.grantedAt.toISOString(),
            expiresAt: receipt.expiresAt ? receipt.expiresAt.toISOString() : null,
            revokedAt: receipt.revokedAt ? receipt.revokedAt.toISOString() : null,
            receiptHash: receipt.receiptHash,
            signature: receipt.signature,
            status: this.readConsentStatus(receipt.status),
        };
    }
    toConsentStatusDto(receipt) {
        return {
            consentId: receipt.consentId,
            serviceId: receipt.serviceId,
            subjectId: receipt.subjectId,
            serviceSubjectId: receipt.serviceSubjectId,
            status: this.readConsentStatus(receipt.status),
            grantedClaims: this.readGrantedClaims(receipt.grantedClaims),
            grantedAt: receipt.grantedAt.toISOString(),
            expiresAt: receipt.expiresAt ? receipt.expiresAt.toISOString() : null,
            revokedAt: receipt.revokedAt ? receipt.revokedAt.toISOString() : null,
        };
    }
    normalizeGrantedClaims(grantedClaims) {
        return [...new Set(grantedClaims)].sort();
    }
    readGrantedClaims(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item) => {
            return (item === 'fullName' ||
                item === 'iin' ||
                item === 'birthDate' ||
                item === 'email' ||
                item === 'verified' ||
                item === 'age18Plus');
        });
    }
    readConsentStatus(value) {
        if (value === ACTIVE_CONSENT_STATUS ||
            value === 'expired' ||
            value === REVOKED_CONSENT_STATUS) {
            return value;
        }
        return ACTIVE_CONSENT_STATUS;
    }
    generateConsentId() {
        return `consent_${(0, crypto_1.randomUUID)().replaceAll('-', '')}`;
    }
    async getConsentReceipt(input) {
        const receipt = await this.findReceiptOwnedByServiceOrThrow(input);
        return this.toReceiptDto(receipt);
    }
};
exports.ConsentReceiptsService = ConsentReceiptsService;
exports.ConsentReceiptsService = ConsentReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subjects_service_1.SubjectsService,
        consent_receipts_signer_1.ConsentReceiptsSigner])
], ConsentReceiptsService);
//# sourceMappingURL=consent-receipts.service.js.map