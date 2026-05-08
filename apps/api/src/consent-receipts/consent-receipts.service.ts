import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  DeKycClaimKey,
  DeKycConsentReceiptDto,
  DeKycConsentStatus,
  DeKycConsentStatusDto,
  DeKycRevokeConsentResponseDto,
} from '@energy/shared';
import type { DeKycConsentReceipt } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { ConsentReceiptsSigner } from './consent-receipts.signer';
import type { CreateConsentReceiptInput } from './types/create-consent-receipt-input.type';
import type { ConsentReceiptSignablePayload } from './types/consent-receipt-signable-payload.type';

const ACTIVE_CONSENT_STATUS = 'active' satisfies DeKycConsentStatus;
const REVOKED_CONSENT_STATUS = 'revoked' satisfies DeKycConsentStatus;

@Injectable()
export class ConsentReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subjectsService: SubjectsService,
    private readonly signer: ConsentReceiptsSigner,
  ) {}

  async createConsentReceipt(
    input: CreateConsentReceiptInput,
  ): Promise<DeKycConsentReceiptDto> {
    const serviceSubject = await this.subjectsService.ensureServiceSubject({
      userId: input.userId,
      serviceId: input.serviceId,
    });

    const grantedAt = new Date();
    const expiresAt = input.expiresAt ?? null;
    const consentId = this.generateConsentId();

    const signablePayload: ConsentReceiptSignablePayload = {
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

  async getConsentStatus(input: {
    consentId: string;
    serviceId: string;
  }): Promise<DeKycConsentStatusDto> {
    const receipt = await this.findReceiptOwnedByServiceOrThrow(input);

    return this.toConsentStatusDto(receipt);
  }

  async listConsentsForServiceSubject(input: {
    serviceSubjectId: string;
    serviceId: string;
  }): Promise<DeKycConsentStatusDto[]> {
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

  async revokeConsent(input: {
    consentId: string;
    serviceId: string;
    reason?: string;
  }): Promise<DeKycRevokeConsentResponseDto> {
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

  private async findReceiptOwnedByServiceOrThrow(input: {
    consentId: string;
    serviceId: string;
  }): Promise<DeKycConsentReceipt> {
    const receipt = await this.prisma.deKycConsentReceipt.findUnique({
      where: {
        consentId: input.consentId,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Consent receipt not found');
    }

    if (receipt.serviceId !== input.serviceId) {
      throw new ForbiddenException('Consent receipt belongs to another service');
    }

    return receipt;
  }

  private toReceiptDto(
    receipt: DeKycConsentReceipt,
  ): DeKycConsentReceiptDto {
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

  private toConsentStatusDto(
    receipt: DeKycConsentReceipt,
  ): DeKycConsentStatusDto {
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

  private normalizeGrantedClaims(
    grantedClaims: DeKycClaimKey[],
  ): DeKycClaimKey[] {
    return [...new Set(grantedClaims)].sort();
  }

  private readGrantedClaims(value: unknown): DeKycClaimKey[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is DeKycClaimKey => {
      return (
        item === 'fullName' ||
        item === 'iin' ||
        item === 'birthDate' ||
        item === 'email' ||
        item === 'verified' ||
        item === 'age18Plus'
      );
    });
  }

  private readConsentStatus(value: string): DeKycConsentStatus {
    if (
      value === ACTIVE_CONSENT_STATUS ||
      value === 'expired' ||
      value === REVOKED_CONSENT_STATUS
    ) {
      return value;
    }

    return ACTIVE_CONSENT_STATUS;
  }

  private generateConsentId(): string {
    return `consent_${randomUUID().replaceAll('-', '')}`;
  }

  async getConsentReceipt(input: {
  consentId: string;
  serviceId: string;
  }): Promise<DeKycConsentReceiptDto> {
    const receipt = await this.findReceiptOwnedByServiceOrThrow(input);

    return this.toReceiptDto(receipt);
  }
}