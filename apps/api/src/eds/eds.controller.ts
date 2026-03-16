import { Body, Controller, Get, Post } from '@nestjs/common';
import { EdsService } from './eds.service';
import { AttestSignatureDto } from './dto/attest-signature.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('eds')
export class EdsController {
  constructor(private readonly edsService: EdsService) {}

  @Get('health')
  health() {
    return {
      ok: true,
      service: 'eds',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('challenge')
  createChallenge() {
    return this.edsService.createChallenge();
  }

  @UseGuards(JwtAuthGuard)
  @Post('attest')
  attest(
    @Body() body: AttestSignatureDto,
    @Req() req: Request & { user: { sub: string; email: string } },
  ) {
    return this.edsService.attestSignature(body, req.user.sub);
  }

  @Post('analyze')
  analyze(@Body() body: SaveAnalysisDto) {
    return this.edsService.saveAnalysis(body);
  }
}