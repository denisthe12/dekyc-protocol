export type EnergyMetadata = {
    title: string;
    description: string;
    location: string;
    assetType: string;
    totalShares: number;
    pricePerShareKzte: number;
    investorBps: number;
    operatorBps: number;
    supportedPayoutModes: Array<'KZTE' | 'ENERGY_POINTS'>;
    createdAt: string;
};
export declare function buildEnergyMetadata(params: {
    assetId: string;
}): EnergyMetadata;
