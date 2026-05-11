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
exports.IdentityAssertionsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const identity_assertions_signer_1 = require("./identity-assertions.signer");
const ACTIVE_CONSENT_STATUS = 'active';
const REVOKED_CONSENT_STATUS = 'revoked';
let IdentityAssertionsService = class IdentityAssertionsService {
    prisma;
    signer;
    constructor(prisma, signer) {
        this.prisma = prisma;
        this.signer = signer;
    }
    async createIdentityAssertion(input) {
        const consentReceipt = await this.prisma.deKycConsentReceipt.findUnique({
            where: {
                consentId: input.consentId,
            },
        });
        if (!consentReceipt) {
            throw new Error('Consent receipt not found');
        }
        if (consentReceipt.userId !== input.userId) {
            throw new Error('Consent receipt user mismatch');
        }
        if (consentReceipt.serviceId !== input.serviceId) {
            throw new Error('Consent receipt service mismatch');
        }
        if (consentReceipt.status !== ACTIVE_CONSENT_STATUS) {
            throw new Error('Consent receipt is not active');
        }
        if (consentReceipt.revokedAt) {
            throw new Error('Consent receipt is revoked');
        }
        if (consentReceipt.expiresAt && consentReceipt.expiresAt.getTime() <= Date.now()) {
            throw new Error('Consent receipt is expired');
        }
        const issuedAtSeconds = Math.floor(Date.now() / 1000);
        const ttlSeconds = this.getAssertionTtlSeconds();
        const expiresAtSeconds = issuedAtSeconds + ttlSeconds;
        const expiresAt = new Date(expiresAtSeconds * 1000);
        const assertionId = this.generateAssertionId();
        const payload = {
            iss: this.getIssuer(),
            aud: input.serviceId,
            assertionId,
            subjectId: consentReceipt.subjectId,
            serviceSubjectId: consentReceipt.serviceSubjectId,
            serviceId: input.serviceId,
            verificationStatus: input.verificationStatus ?? 'verified',
            verificationTime: new Date().toISOString(),
            kycProvider: input.kycProvider ?? 'dekyc_eds_ncalayer',
            assuranceLevel: input.assuranceLevel ?? 'mock_biometric_eds',
            consentId: consentReceipt.consentId,
            claimsScope: this.normalizeClaimsScope(input.claimsScope),
            revocationStatus: ACTIVE_CONSENT_STATUS,
            iat: issuedAtSeconds,
            exp: expiresAtSeconds,
        };
        const assertionJws = this.signer.signPayload(payload);
        await this.prisma.deKycIdentityAssertion.create({
            data: {
                assertionId,
                userId: input.userId,
                serviceId: input.serviceId,
                subjectId: payload.subjectId,
                serviceSubjectId: payload.serviceSubjectId,
                consentId: payload.consentId,
                payloadJson: this.toPrismaJsonObject(payload),
                assertionJws,
                expiresAt,
                revokedAt: null,
            },
        });
        return {
            assertionJws,
            payload,
            algorithm: 'HS256',
        };
    }
    async verifyAssertion(assertionJws) {
        const decoded = this.signer.verifyAndDecode(assertionJws);
        if (!decoded.valid || !decoded.payload) {
            return {
                valid: false,
                reason: decoded.reason ?? 'invalid_assertion',
                payload: null,
            };
        }
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (decoded.payload.exp <= nowSeconds) {
            return {
                valid: false,
                reason: 'assertion_expired',
                payload: decoded.payload,
            };
        }
        const assertion = await this.prisma.deKycIdentityAssertion.findUnique({
            where: {
                assertionId: decoded.payload.assertionId,
            },
        });
        if (!assertion) {
            return {
                valid: false,
                reason: 'assertion_not_found',
                payload: decoded.payload,
            };
        }
        if (assertion.revokedAt) {
            return {
                valid: false,
                reason: 'assertion_revoked',
                payload: decoded.payload,
            };
        }
        if (assertion.expiresAt.getTime() <= Date.now()) {
            return {
                valid: false,
                reason: 'assertion_expired',
                payload: decoded.payload,
            };
        }
        const consentReceipt = await this.prisma.deKycConsentReceipt.findUnique({
            where: {
                consentId: decoded.payload.consentId,
            },
        });
        if (!consentReceipt) {
            return {
                valid: false,
                reason: 'consent_not_found',
                payload: decoded.payload,
            };
        }
        if (consentReceipt.status === REVOKED_CONSENT_STATUS ||
            consentReceipt.revokedAt) {
            return {
                valid: false,
                reason: 'consent_revoked',
                payload: {
                    ...decoded.payload,
                    revocationStatus: REVOKED_CONSENT_STATUS,
                },
            };
        }
        if (consentReceipt.expiresAt &&
            consentReceipt.expiresAt.getTime() <= Date.now()) {
            return {
                valid: false,
                reason: 'consent_expired',
                payload: {
                    ...decoded.payload,
                    revocationStatus: 'expired',
                },
            };
        }
        return {
            valid: true,
            reason: null,
            payload: decoded.payload,
        };
    }
    normalizeClaimsScope(claimsScope) {
        return [...new Set(claimsScope)].sort();
    }
    generateAssertionId() {
        return `assert_${(0, crypto_1.randomUUID)().replaceAll('-', '')}`;
    }
    getIssuer() {
        return (process.env.DEKYC_CONNECT_ISSUER_URL ??
            'http://localhost:3001/api');
    }
    getAssertionTtlSeconds() {
        const rawValue = process.env.DEKYC_CONNECT_ASSERTION_TTL_SECONDS;
        const parsed = rawValue ? Number(rawValue) : 300;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 300;
        }
        return Math.floor(parsed);
    }
    toPrismaJsonObject(payload) {
        return {
            iss: payload.iss,
            aud: payload.aud,
            assertionId: payload.assertionId,
            subjectId: payload.subjectId,
            serviceSubjectId: payload.serviceSubjectId,
            serviceId: payload.serviceId,
            verificationStatus: payload.verificationStatus,
            verificationTime: payload.verificationTime,
            kycProvider: payload.kycProvider,
            assuranceLevel: payload.assuranceLevel,
            consentId: payload.consentId,
            claimsScope: payload.claimsScope,
            revocationStatus: payload.revocationStatus,
            iat: payload.iat,
            exp: payload.exp,
        };
    }
};
exports.IdentityAssertionsService = IdentityAssertionsService;
exports.IdentityAssertionsService = IdentityAssertionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        identity_assertions_signer_1.IdentityAssertionsSigner])
], IdentityAssertionsService);
//# sourceMappingURL=identity-assertions.service.js.map