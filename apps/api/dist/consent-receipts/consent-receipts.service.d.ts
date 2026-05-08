import type { DeKycConsentReceiptDto, DeKycConsentStatusDto, DeKycRevokeConsentResponseDto } from '@energy/shared';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { ConsentReceiptsSigner } from './consent-receipts.signer';
import type { CreateConsentReceiptInput } from './types/create-consent-receipt-input.type';
export declare class ConsentReceiptsService {
    private readonly prisma;
    private readonly subjectsService;
    private readonly signer;
    constructor(prisma: PrismaService, subjectsService: SubjectsService, signer: ConsentReceiptsSigner);
    createConsentReceipt(input: CreateConsentReceiptInput): Promise<DeKycConsentReceiptDto>;
    getConsentStatus(input: {
        consentId: string;
        serviceId: string;
    }): Promise<DeKycConsentStatusDto>;
    listConsentsForServiceSubject(input: {
        serviceSubjectId: string;
        serviceId: string;
    }): Promise<DeKycConsentStatusDto[]>;
    revokeConsent(input: {
        consentId: string;
        serviceId: string;
        reason?: string;
    }): Promise<DeKycRevokeConsentResponseDto>;
    private findReceiptOwnedByServiceOrThrow;
    private toReceiptDto;
    private toConsentStatusDto;
    private normalizeGrantedClaims;
    private readGrantedClaims;
    private readConsentStatus;
    private generateConsentId;
    getConsentReceipt(input: {
        consentId: string;
        serviceId: string;
    }): Promise<DeKycConsentReceiptDto>;
}
