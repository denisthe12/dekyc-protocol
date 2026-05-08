import type { DeKycClaimKey, DeKycTokenResponseDto } from '@energy/shared';
import { ConsentReceiptsService } from '../consent-receipts/consent-receipts.service';
import { IdentityAssertionsService } from '../identity-assertions/identity-assertions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import type { AuthorizeQueryDto } from './dto/authorize-query.dto';
import type { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import type { TokenRequestDto } from './dto/token-request.dto';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';
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
    previewAuthorizeRequest(query: AuthorizeQueryDto): Promise<{
        status: string;
        nextAction: string;
        service: {
            id: string;
            name: string;
            clientId: string;
        };
        authorizationRequest: {
            responseType: string;
            clientId: string;
            redirectUri: string;
            scope: DeKycClaimKey[];
            state: string | null;
            nonce: string | null;
        };
        note: string;
    }>;
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
}
export {};
