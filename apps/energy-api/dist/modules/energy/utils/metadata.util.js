"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnergyMetadata = buildEnergyMetadata;
function buildEnergyMetadata(params) {
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
//# sourceMappingURL=metadata.util.js.map