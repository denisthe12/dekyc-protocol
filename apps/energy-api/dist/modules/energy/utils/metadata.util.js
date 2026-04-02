"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnergyMetadata = buildEnergyMetadata;
function buildEnergyMetadata(params) {
    return {
        title: `Solar Microgrid ${params.assetId}`,
        description: 'Tokenized solar microgrid revenue rights with dual payout modes: KZTE or ENERGY_POINTS.',
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
//# sourceMappingURL=metadata.util.js.map