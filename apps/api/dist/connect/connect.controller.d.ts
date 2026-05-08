import { ConnectService } from './connect.service';
import { AuthorizeQueryDto } from './dto/authorize-query.dto';
import { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import { TokenRequestDto } from './dto/token-request.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';
export declare class ConnectController {
    private readonly connectService;
    constructor(connectService: ConnectService);
    authorize(query: AuthorizeQueryDto): Promise<{
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
            scope: import("@energy/shared").DeKycClaimKey[];
            state: string | null;
            nonce: string | null;
        };
        note: string;
    }>;
    completeAuthorizationForDev(body: CompleteAuthorizationDto, masterSecret: string | undefined): Promise<CompleteAuthorizationResult>;
    exchangeToken(body: TokenRequestDto, req: AuthenticatedServiceRequest): Promise<import("@energy/shared").DeKycTokenResponseDto>;
}
