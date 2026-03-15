import { EdsService } from './eds.service';
import { AttestSignatureDto } from './dto/attest-signature.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
export declare class EdsController {
    private readonly edsService;
    constructor(edsService: EdsService);
    health(): {
        ok: boolean;
        service: string;
        timestamp: string;
    };
    createChallenge(): import("./eds.service").EdsChallengeResponse;
    attest(body: AttestSignatureDto): {
        ok: boolean;
        message: string;
        challengeId: string;
        challengeBase64: string;
        cmsSignatureLength: number;
        parsedCertificate: import("./eds.types").ParsedCertificateInfo;
        cmsDebug: Record<string, string>;
        receivedAt: string;
        extractedIdentity: import("./eds-certificate-extractor").ExtractedCertificateIdentity;
    };
    analyze(body: SaveAnalysisDto): {
        ok: boolean;
        filePath: string;
        summary: {
            realFieldsForMvp: string[];
            missingFieldsForManualOrMock: string[];
        };
    };
}
