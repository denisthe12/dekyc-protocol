import { Body, Controller, Get, Post } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';

@Controller('solana')
export class SolanaController {
  public constructor(
    private readonly solanaService: SolanaService,
    private readonly token2022Service: Token2022Service,
  ) {}

  @Get('status')
  public async getStatus() {
    const signer = await this.solanaService.getSignerStatus();
    const kzte = await this.token2022Service.getKzteMintStatus();

    return {
      rpcUrl: signer.rpcUrl,
      signerAddress: signer.signerAddress,
      signerBalanceSol: signer.signerBalanceSol,
      kzte,
      tokenizationProgramId: this.solanaService.getProgramId().toBase58(),
    };
  }

  @Post('kzte/init')
  public async createKzteMint() {
    return this.token2022Service.createKzteMint();
  }

  @Post('kzte/mint-to-signer')
  public async mintKzteToSigner(
    @Body() body?: { amountKzte?: number },
  ) {
    return this.token2022Service.mintKzteToSigner({
      amountKzte: body?.amountKzte,
    });
  }
}