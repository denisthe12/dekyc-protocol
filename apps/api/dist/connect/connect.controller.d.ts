import { ConnectService } from './connect.service';
import { AuthorizeQueryDto } from './dto/authorize-query.dto';
import { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import { TokenRequestDto } from './dto/token-request.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';
import { ApproveAuthorizationSessionDto } from './dto/approve-authorization-session.dto';
import { RejectAuthorizationSessionDto } from './dto/reject-authorization-session.dto';
import type { ConnectAuthorizationDecisionResponse, ConnectAuthorizationSessionDetailResponse, ConnectAuthorizationSessionResponse } from './types/connect-authorization-session-response.type';
import type { PlatformAuthenticatedRequest } from './types/platform-authenticated-request.type';
export declare class ConnectController {
    private readonly connectService;
    constructor(connectService: ConnectService);
    authorize(query: AuthorizeQueryDto): Promise<ConnectAuthorizationSessionResponse>;
    completeAuthorizationForDev(body: CompleteAuthorizationDto, masterSecret: string | undefined): Promise<CompleteAuthorizationResult>;
    exchangeToken(body: TokenRequestDto, req: AuthenticatedServiceRequest): Promise<import("@energy/shared").DeKycTokenResponseDto>;
    getAuthorizationSession(sessionId: string, req: PlatformAuthenticatedRequest): Promise<ConnectAuthorizationSessionDetailResponse>;
    approveAuthorizationSession(sessionId: string, body: ApproveAuthorizationSessionDto, req: PlatformAuthenticatedRequest): Promise<ConnectAuthorizationDecisionResponse>;
    rejectAuthorizationSession(sessionId: string, body: RejectAuthorizationSessionDto, req: PlatformAuthenticatedRequest): Promise<ConnectAuthorizationDecisionResponse>;
}
