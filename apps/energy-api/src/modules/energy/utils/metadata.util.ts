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

export function buildEnergyMetadata(params: {
  assetId: string;
}) : EnergyMetadata {
  return {
    title: `Solar Roof ${params.assetId}`,
    description: 'Demo asset created from energy-api and Anchor program',
    location: 'Aktau, Kazakhstan',
    assetType: 'SOLAR',
    totalShares: 1000,
    pricePerShareKzte: 10000,
    investorBps: 8000,
    operatorBps: 2000,
    payoutMode: 'KZTE',
    createdAt: new Date().toISOString(),
  };
}