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

export function buildEnergyMetadata(params: {
  assetId: string;
}): EnergyMetadata {
  return {
    title: `Solar Microgrid ${params.assetId}`,
    description:
      'Tokenized solar microgrid revenue rights with dual payout modes: KZTE or ENERGY_POINTS.',
    location: 'Mangystau Region, Kazakhstan',
    assetType: 'SOLAR',
    totalShares: 1000,
    pricePerShareKzte: 10000,
    investorBps: 8000,
    operatorBps: 2000,
    supportedPayoutModes: ['KZTE', 'ENERGY_POINTS'],
    createdAt: new Date().toISOString(),
  };
}