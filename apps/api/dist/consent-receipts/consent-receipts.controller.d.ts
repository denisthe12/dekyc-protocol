import { ConsentReceiptsService } from './consent-receipts.service';
import { RevokeConsentDto } from './dto/revoke-consent.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
export declare class ConsentReceiptsController {
    private readonly consentReceiptsService;
    constructor(consentReceiptsService: ConsentReceiptsService);
    getConsentStatus(consentId: string, req: AuthenticatedServiceRequest): Promise<import("@energy/shared").DeKycConsentStatusDto>;
    revokeConsent(consentId: string, body: RevokeConsentDto, req: AuthenticatedServiceRequest): Promise<import("@energy/shared").DeKycRevokeConsentResponseDto>;
    listConsentsForServiceSubject(serviceSubjectId: string, req: AuthenticatedServiceRequest): Promise<import("@energy/shared").DeKycConsentStatusDto[]>;
}
