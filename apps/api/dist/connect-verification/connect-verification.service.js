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
exports.ConnectVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConnectVerificationService = class ConnectVerificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSnapshot() {
        const [authorizationSessions, consentReceipts, identityAssertions, authorizationSessionTotals, consentReceiptTotals, identityAssertionTotals,] = await Promise.all([
            this.prisma.deKycConnectAuthorizationSession.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 12,
            }),
            this.prisma.deKycConsentReceipt.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 12,
            }),
            this.prisma.deKycIdentityAssertion.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 12,
            }),
            this.prisma.deKycConnectAuthorizationSession.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            }),
            this.prisma.deKycConsentReceipt.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            }),
            this.prisma.deKycIdentityAssertion.findMany({
                select: {
                    expiresAt: true,
                    revokedAt: true,
                },
            }),
        ]);
        const now = Date.now();
        return {
            issuer: {
                issuerUrl: this.getIssuerUrl(),
                metadataUrl: `${this.getIssuerUrl()}/.well-known/dekyc-issuer`,
                jwksUrl: `${this.getIssuerUrl()}/.well-known/jwks.json`,
                verifyEndpoint: `${this.getIssuerUrl()}/connect/assertions/verify`,
                algorithm: 'HS256',
            },
            totals: {
                authorizationSessions: this.sumGroupedCounts(authorizationSessionTotals),
                pendingSessions: this.getGroupedCount(authorizationSessionTotals, 'pending'),
                approvedSessions: this.getGroupedCount(authorizationSessionTotals, 'approved'),
                rejectedSessions: this.getGroupedCount(authorizationSessionTotals, 'rejected'),
                consentReceipts: this.sumGroupedCounts(consentReceiptTotals),
                activeConsents: this.getGroupedCount(consentReceiptTotals, 'active'),
                revokedConsents: this.getGroupedCount(consentReceiptTotals, 'revoked'),
                identityAssertions: identityAssertionTotals.length,
                activeAssertions: identityAssertionTotals.filter((assertion) => {
                    return !assertion.revokedAt && assertion.expiresAt.getTime() > now;
                }).length,
                expiredAssertions: identityAssertionTotals.filter((assertion) => {
                    return assertion.expiresAt.getTime() <= now;
                }).length,
            },
            authorizationSessions: authorizationSessions.map((session) => ({
                sessionId: session.sessionId,
                status: session.status,
                clientId: session.clientId,
                serviceId: session.serviceId,
                redirectUri: session.redirectUri,
                claimsScope: this.readStringArray(session.claimsScope),
                userId: session.userId,
                consentId: session.consentId,
                expiresAt: session.expiresAt.toISOString(),
                approvedAt: session.approvedAt?.toISOString() ?? null,
                rejectedAt: session.rejectedAt?.toISOString() ?? null,
                completedAt: session.completedAt?.toISOString() ?? null,
                createdAt: session.createdAt.toISOString(),
            })),
            consentReceipts: consentReceipts.map((receipt) => ({
                consentId: receipt.consentId,
                serviceId: receipt.serviceId,
                subjectId: receipt.subjectId,
                serviceSubjectId: receipt.serviceSubjectId,
                grantedClaims: this.readStringArray(receipt.grantedClaims),
                consentTextVersion: receipt.consentTextVersion,
                status: receipt.status,
                receiptHash: receipt.receiptHash,
                signaturePreview: this.preview(receipt.signature),
                grantedAt: receipt.grantedAt.toISOString(),
                expiresAt: receipt.expiresAt?.toISOString() ?? null,
                revokedAt: receipt.revokedAt?.toISOString() ?? null,
            })),
            identityAssertions: identityAssertions.map((assertion) => ({
                assertionId: assertion.assertionId,
                serviceId: assertion.serviceId,
                subjectId: assertion.subjectId,
                serviceSubjectId: assertion.serviceSubjectId,
                consentId: assertion.consentId,
                algorithm: 'HS256',
                assertionJws: assertion.assertionJws,
                assertionPreview: this.preview(assertion.assertionJws),
                expiresAt: assertion.expiresAt.toISOString(),
                revokedAt: assertion.revokedAt?.toISOString() ?? null,
                createdAt: assertion.createdAt.toISOString(),
            })),
        };
    }
    getIssuerUrl() {
        return process.env.DEKYC_CONNECT_ISSUER_URL ?? 'http://localhost:3001/api';
    }
    readStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    preview(value) {
        if (value.length <= 24) {
            return value;
        }
        return `${value.slice(0, 12)}...${value.slice(-12)}`;
    }
    getGroupedCount(groups, status) {
        return groups.find((group) => group.status === status)?._count.status ?? 0;
    }
    sumGroupedCounts(groups) {
        return groups.reduce((sum, group) => sum + group._count.status, 0);
    }
};
exports.ConnectVerificationService = ConnectVerificationService;
exports.ConnectVerificationService = ConnectVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConnectVerificationService);
//# sourceMappingURL=connect-verification.service.js.map