import { Body, Controller, Get, Post } from '@nestjs/common';
import { EdsService } from './eds.service';
import { AttestSignatureDto } from './dto/attest-signature.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';

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

  @Post('attest')
  attest(@Body() body: AttestSignatureDto) {
    return this.edsService.attestSignature(body);
  }

  @Post('analyze')
  analyze(@Body() body: SaveAnalysisDto) {
    return this.edsService.saveAnalysis(body);
  }
}