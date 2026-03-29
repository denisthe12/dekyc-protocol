import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { Idl } from '@coral-xyz/anchor';
import { SolanaService } from './solana.service';

@Injectable()
export class AnchorService {
  public readonly provider: anchor.AnchorProvider;
  public readonly program: anchor.Program<Idl>;

  public constructor(private readonly solanaService: SolanaService) {
    const wallet = new anchor.Wallet(
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      undefined as never,
    );

    // мы не используем этот wallet напрямую, а ниже подменяем его реальным signer
    void wallet;
    throw new Error(
      'AnchorService must be initialized through static create(). Use AnchorServiceFactory pattern.',
    );
  }

  public static async create(
    solanaService: SolanaService,
  ): Promise<AnchorService> {
    const signer = await solanaService.getSigner();
    const wallet = new anchor.Wallet(signer);

    const provider = new anchor.AnchorProvider(
      solanaService.getConnection(),
      wallet,
      { commitment: 'confirmed' },
    );

    anchor.setProvider(provider);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const idl = require('../../../idl/tokenization_case.json') as Idl;

    const program = new anchor.Program(idl, provider);

    const instance = Object.create(AnchorService.prototype) as AnchorService;
    Object.defineProperty(instance, 'provider', { value: provider });
    Object.defineProperty(instance, 'program', { value: program });
    Object.defineProperty(instance, 'solanaService', { value: solanaService });

    return instance;
  }
}