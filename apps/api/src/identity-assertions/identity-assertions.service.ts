import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  DeKycClaimKey,
  DeKycConsentStatus,
  DeKycIdentityAssertionDto,
  DeKycIdentityAssertionPayload,
  DeKycVerifyAssertionResponseDto,
} from '@energy/shared';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityAssertionsSigner } from './identity-assertions.signer';
import type { CreateIdentityAssertionInput } from './types/create-identity-assertion-input.type';
import type { Prisma } from '../../prisma/generated/client';

const ACTIVE_CONSENT_STATUS = 'active' satisfies DeKycConsentStatus;
const REVOKED_CONSENT_STATUS = 'revoked' satisfies DeKycConsentStatus;

@Injectable()
export class IdentityAssertionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: IdentityAssertionsSigner,
  ) {}

  async createIdentityAssertion(
    input: CreateIdentityAssertionInput,
  ): Promise<DeKycIdentityAssertionDto> {
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

    const payload: DeKycIdentityAssertionPayload = {
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

  async verifyAssertion(
    assertionJws: string,
  ): Promise<DeKycVerifyAssertionResponseDto> {
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

    if (
      consentReceipt.status === REVOKED_CONSENT_STATUS ||
      consentReceipt.revokedAt
    ) {
      return {
        valid: false,
        reason: 'consent_revoked',
        payload: {
          ...decoded.payload,
          revocationStatus: REVOKED_CONSENT_STATUS,
        },
      };
    }

    if (
      consentReceipt.expiresAt &&
      consentReceipt.expiresAt.getTime() <= Date.now()
    ) {
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

  private normalizeClaimsScope(claimsScope: DeKycClaimKey[]): DeKycClaimKey[] {
    return [...new Set(claimsScope)].sort();
  }

  private generateAssertionId(): string {
    return `assert_${randomUUID().replaceAll('-', '')}`;
  }

  private getIssuer(): string {
    return (
      process.env.DEKYC_CONNECT_ISSUER_URL ??
      'http://localhost:3001/api'
    );
  }

  private getAssertionTtlSeconds(): number {
    const rawValue = process.env.DEKYC_CONNECT_ASSERTION_TTL_SECONDS;
    const parsed = rawValue ? Number(rawValue) : 300;

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 300;
    }

    return Math.floor(parsed);
  }

  private toPrismaJsonObject(
    payload: DeKycIdentityAssertionPayload,
    ): Prisma.InputJsonObject {
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
}