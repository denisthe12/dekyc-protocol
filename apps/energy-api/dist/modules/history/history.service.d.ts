import { PrismaService } from '@/modules/prisma/prisma.service';
export type HistoryEventItem = {
    id: string;
    type: 'INITIAL_KZTE_AIRDROP' | 'PRIMARY_BUY' | 'REVENUE_EPOCH_CREATED' | 'PAYOUT_CLAIM' | 'OTC_LISTING_CREATED' | 'OTC_LISTING_FILLED';
    title: string;
    description: string;
    assetId: string | null;
    txSignature: string | null;
    createdAt: string;
};
export declare class HistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserHistory(energyUserId: string): Promise<HistoryEventItem[]>;
}
