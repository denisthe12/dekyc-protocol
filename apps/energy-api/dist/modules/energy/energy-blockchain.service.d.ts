import { PublicKey } from '@solana/web3.js';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { type EnergyMetadata } from './utils/metadata.util';
export type CreatedEnergyAssetResult = {
    registryPda: string;
    registryTx: string | null;
    assetId: string;
    assetPda: string;
    shareMint: string;
    treasuryShareAccount: string;
    createAssetTx: string;
    issueSharesTx: string;
    metadata: EnergyMetadata;
    metadataHash: string;
};
export declare class EnergyBlockchainService {
    private readonly anchorService;
    private readonly solanaService;
    constructor(anchorService: AnchorService, solanaService: SolanaService);
    getRegistryPda(): Promise<PublicKey>;
    createRegistryIfNeeded(): Promise<{
        registryPda: string;
        tx: string | null;
    }>;
    createEnergyAsset(): Promise<CreatedEnergyAssetResult>;
}
