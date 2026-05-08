import type { DeKycTokenResponseDto } from '@energy/shared';
import { ConsentReceiptsService } from '../consent-receipts/consent-receipts.service';
import { IdentityAssertionsService } from '../identity-assertions/identity-assertions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import type { AuthorizeQueryDto } from './dto/authorize-query.dto';
import type { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import type { TokenRequestDto } from './dto/token-request.dto';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';
import type { ConnectAuthorizationDecisionResponse, ConnectAuthorizationSessionDetailResponse, ConnectAuthorizationSessionResponse } from './types/connect-authorization-session-response.type';
import type { ApproveAuthorizationSessionDto } from './dto/approve-authorization-session.dto';
import type { RejectAuthorizationSessionDto } from './dto/reject-authorization-session.dto';
interface ServiceAuthContext {
    serviceId: string;
    clientId: string;
}
export declare class ConnectService {
    private readonly prisma;
    private readonly servicesService;
    private readonly consentReceiptsService;
    private readonly identityAssertionsService;
    constructor(prisma: PrismaService, servicesService: ServicesService, consentReceiptsService: ConsentReceiptsService, identityAssertionsService: IdentityAssertionsService);
    createAuthorizationSession(query: AuthorizeQueryDto): Promise<ConnectAuthorizationSessionResponse>;
    getAuthorizationSessionForUser(input: {
        sessionId: string;
        userId: string;
    }): Promise<ConnectAuthorizationSessionDetailResponse>;
    approveAuthorizationSession(input: {
        sessionId: string;
        userId: string;
        body: ApproveAuthorizationSessionDto;
    }): Promise<ConnectAuthorizationDecisionResponse>;
    rejectAuthorizationSession(input: {
        sessionId: string;
        userId: string;
        body: RejectAuthorizationSessionDto;
    }): Promise<ConnectAuthorizationDecisionResponse>;
    completeAuthorizationForDev(input: CompleteAuthorizationDto, masterSecret: string | undefined): Promise<CompleteAuthorizationResult>;
    exchangeAuthorizationCode(input: {
        body: TokenRequestDto;
        serviceAuth: ServiceAuthContext;
    }): Promise<DeKycTokenResponseDto>;
    private getClientIdFromAuthorizeQuery;
    private resolveUserIdForDev;
    private buildMinimalClaims;
    private calculateAge18Plus;
    private parseClaimsScope;
    private readClaimsScope;
    private isClaimKey;
    private normalizeRedirectUri;
    private normalizeRequiredString;
    private generateAuthorizationCode;
    private hashAuthorizationCode;
    private buildCodeExpiresAt;
    private buildConsentExpiresAt;
    private getAuthorizationCodeTtlSeconds;
    private buildRedirectUriWithCode;
    private assertDevCompleteAllowed;
    private toJsonArray;
    private getAuthorizationSessionOrThrow;
    private generateAuthorizationSessionId;
    private buildAuthorizationSessionExpiresAt;
    private getAuthorizationSessionTtlSeconds;
    private buildPlatformConsentUrl;
    private assertApprovedClaimsSubset;
    private buildRedirectUriWithError;
    private readStringArray;
}
export {};
