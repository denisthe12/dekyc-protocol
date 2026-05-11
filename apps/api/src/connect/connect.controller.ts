import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ConnectService } from './connect.service';
import { AuthorizeQueryDto } from './dto/authorize-query.dto';
import { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import { TokenRequestDto } from './dto/token-request.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApproveAuthorizationSessionDto } from './dto/approve-authorization-session.dto';
import { RejectAuthorizationSessionDto } from './dto/reject-authorization-session.dto';
import type {
  ConnectAuthorizationDecisionResponse,
  ConnectAuthorizationSessionDetailResponse,
  ConnectAuthorizationSessionResponse,
} from './types/connect-authorization-session-response.type';
import type { PlatformAuthenticatedRequest } from './types/platform-authenticated-request.type';

@Controller('connect')
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @Get('authorize')
  authorize(
    @Query() query: AuthorizeQueryDto,
  ): Promise<ConnectAuthorizationSessionResponse> {
    return this.connectService.createAuthorizationSession(query);
  }

  @Post('dev/authorize/complete')
  completeAuthorizationForDev(
    @Body() body: CompleteAuthorizationDto,
    @Headers('x-master-secret') masterSecret: string | undefined,
  ): Promise<CompleteAuthorizationResult> {
    return this.connectService.completeAuthorizationForDev(body, masterSecret);
  }

  @UseGuards(ServiceCredentialsGuard)
  @Post('token')
  exchangeToken(
    @Body() body: TokenRequestDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.connectService.exchangeAuthorizationCode({
      body,
      serviceAuth: {
        serviceId: req.serviceAuth.serviceId,
        clientId: req.serviceAuth.clientId,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('authorization-sessions/:sessionId')
  getAuthorizationSession(
    @Param('sessionId') sessionId: string,
    @Req() req: PlatformAuthenticatedRequest,
  ): Promise<ConnectAuthorizationSessionDetailResponse> {
    return this.connectService.getAuthorizationSessionForUser({
      sessionId,
      userId: req.user.sub,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('authorization-sessions/:sessionId/approve')
  approveAuthorizationSession(
    @Param('sessionId') sessionId: string,
    @Body() body: ApproveAuthorizationSessionDto,
    @Req() req: PlatformAuthenticatedRequest,
  ): Promise<ConnectAuthorizationDecisionResponse> {
    return this.connectService.approveAuthorizationSession({
      sessionId,
      userId: req.user.sub,
      body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('authorization-sessions/:sessionId/reject')
  rejectAuthorizationSession(
    @Param('sessionId') sessionId: string,
    @Body() body: RejectAuthorizationSessionDto,
    @Req() req: PlatformAuthenticatedRequest,
  ): Promise<ConnectAuthorizationDecisionResponse> {
    return this.connectService.rejectAuthorizationSession({
      sessionId,
      userId: req.user.sub,
      body,
    });
  }
}