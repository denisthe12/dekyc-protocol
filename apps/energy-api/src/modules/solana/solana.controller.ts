import { Controller, Get, Post } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
import { SolanaStatusResponseDto } from './dto/solana-status.response.dto';
import { CreateKzteMintResponseDto } from './dto/create-kzte-mint.response.dto';

@Controller('solana')
export class SolanaController {
  public constructor(
    private readonly solanaService: SolanaService,
    private readonly token2022Service: Token2022Service,
  ) {}

  @Get('status')
  public async getStatus(): Promise<SolanaStatusResponseDto> {
    const signer = await this.solanaService.getSignerStatus();
    const kzte = await this.token2022Service.getKzteMintStatus();

    return {
      rpcUrl: signer.rpcUrl,
      signerAddress: signer.signerAddress,
      signerBalanceSol: signer.signerBalanceSol,
      kzte,
    };
  }

  @Post('kzte/init')
  public async createKzteMint(): Promise<CreateKzteMintResponseDto> {
    return this.token2022Service.createKzteMint();
  }
}