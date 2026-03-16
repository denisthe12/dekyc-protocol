import { AttestSignatureDto } from './dto/attest-signature.dto';
import { ParsedCertificateInfo } from './eds.types';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserCertService } from '../user-cert/user-cert.service';
import { KycProfileService } from '../kyc-profile/kyc-profile.service';
import { KycVaultService } from '../kyc-vault/kyc-vault.service';
export interface EdsChallengeResponse {
    challengeId: string;
    challengeBase64: string;
    expiresAt: string;
}
export declare class EdsService {
    private readonly prisma;
    private readonly userCertService;
    private readonly kycProfileService;
    private readonly kycVaultService;
    private readonly challenges;
    constructor(prisma: PrismaService, userCertService: UserCertService, kycProfileService: KycProfileService, kycVaultService: KycVaultService);
    createChallenge(): EdsChallengeResponse;
    attestSignature(payload: AttestSignatureDto, userId: string): Promise<{
        ok: boolean;
        message: string;
        challengeId: string;
        challengeBase64: string;
        cmsSignatureLength: number;
        parsedCertificate: ParsedCertificateInfo;
        savedUserCertId: string;
        savedKycProfileId: string;
        savedKycVaultEntryId: string;
        cmsDebug: Record<string, string>;
        receivedAt: string;
        extractedIdentity: import("./eds-certificate-extractor").ExtractedCertificateIdentity;
    }>;
    saveAnalysis(payload: SaveAnalysisDto): {
        ok: boolean;
        filePath: string;
        summary: {
            realFieldsForMvp: string[];
            missingFieldsForManualOrMock: string[];
        };
    };
    private extractCertificateInfoFromCms;
    private normalizeCmsInput;
    private extractFirstCertificatePem;
    private extractDnField;
    private extractProbableIin;
}
