import { AttestSignatureDto } from './dto/attest-signature.dto';
import { ParsedCertificateInfo } from './eds.types';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
export interface EdsChallengeResponse {
    challengeId: string;
    challengeBase64: string;
    expiresAt: string;
}
export declare class EdsService {
    private readonly challenges;
    createChallenge(): EdsChallengeResponse;
    attestSignature(payload: AttestSignatureDto): {
        ok: boolean;
        message: string;
        challengeId: string;
        challengeBase64: string;
        cmsSignatureLength: number;
        parsedCertificate: ParsedCertificateInfo;
        cmsDebug: Record<string, string>;
        receivedAt: string;
        extractedIdentity: import("./eds-certificate-extractor").ExtractedCertificateIdentity;
    };
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
