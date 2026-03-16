import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
export type SaveKycVaultEntryInput = {
    userId: string;
    kycProfileId: string;
    profileJson: unknown;
};
export declare class KycVaultService {
    private readonly prisma;
    private readonly cryptoService;
    constructor(prisma: PrismaService, cryptoService: CryptoService);
    saveVaultEntry(input: SaveKycVaultEntryInput): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        kycProfileId: string;
        kycHash: string;
        cipherText: string;
        iv: string;
        authTag: string;
        keyVersion: string;
        algorithm: string;
    }>;
}
