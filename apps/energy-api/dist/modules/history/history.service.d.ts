import { PrismaService } from '@/modules/prisma/prisma.service';
export type HistoryEventItem = {
    id: string;
    type: 'PRIMARY_BUY' | 'OTC_LISTING_CREATED' | 'OTC_LISTING_FILLED' | 'CLAIM';
    assetId: string;
    title: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS' | null;
    amountBaseUnits: number | null;
    shareAmount: number | null;
    tx: string | null;
    secondaryTx: string | null;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
};
export declare class HistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserHistory(energyUserId: string): Promise<HistoryEventItem[]>;
}
