export type EnergyMetadata = {
    title: string;
    description: string;
    location: string;
    assetType: string;
    totalShares: number;
    pricePerShareKzte: number;
    investorBps: number;
    operatorBps: number;
    payoutMode: string;
    createdAt: string;
};
export declare function buildEnergyMetadata(params: {
    assetId: string;
}): EnergyMetadata;
