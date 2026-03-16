import { Test, TestingModule } from '@nestjs/testing';
import { KycProfileService } from './kyc-profile.service';

describe('KycProfileService', () => {
  let service: KycProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KycProfileService],
    }).compile();

    service = module.get<KycProfileService>(KycProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
