import type { ConnectVerificationSnapshot } from './types/connect-verification-snapshot.type';
import { PrismaService } from '../prisma/prisma.service';
export declare class ConnectVerificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSnapshot(): Promise<ConnectVerificationSnapshot>;
    private getIssuerUrl;
    private readStringArray;
    private preview;
    private getGroupedCount;
    private sumGroupedCounts;
}
