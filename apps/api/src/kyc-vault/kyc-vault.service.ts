import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';

export type SaveKycVaultEntryInput = {
  userId: string;
  kycProfileId: string;
  profileJson: unknown;
};

@Injectable()
export class KycVaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async saveVaultEntry(input: SaveKycVaultEntryInput) {
    const kycHash = this.cryptoService.computeKycHash(input.profileJson);
    const encrypted = this.cryptoService.encryptJson(input.profileJson);

    const existing = await this.prisma.kycVaultEntry.findFirst({
      where: {
        kycProfileId: input.kycProfileId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existing) {
      return this.prisma.kycVaultEntry.update({
        where: { id: existing.id },
        data: {
          userId: input.userId,
          kycProfileId: input.kycProfileId,
          kycHash,
          cipherText: encrypted.cipherText,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          keyVersion: encrypted.keyVersion,
          algorithm: encrypted.algorithm,
        },
      });
    }

    return this.prisma.kycVaultEntry.create({
      data: {
        userId: input.userId,
        kycProfileId: input.kycProfileId,
        kycHash,
        cipherText: encrypted.cipherText,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
        algorithm: encrypted.algorithm,
      },
    });
  }
}