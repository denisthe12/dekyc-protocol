import { PrismaService } from '@/modules/prisma/prisma.service';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
export declare class OtcService {
    private readonly prisma;
    private readonly anchorService;
    private readonly solanaService;
    constructor(prisma: PrismaService, anchorService: AnchorService, solanaService: SolanaService);
    createDemoListing(params: {
        energyUserId: string;
        assetId: string;
        shareAmount: number;
        pricePerShareKzte: number;
    }): Promise<{
        listingPda: string;
        escrowShareAccount: string;
        tx: string;
        db: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("prisma/generated/client").$Enums.EnergyOtcListingStatus;
            energyAssetId: string;
            assetId: string;
            assetPda: string;
            shareMintAddress: string;
            pricePerShareKzte: number;
            shareAmount: number;
            listingPda: string;
            sellerShareAccount: string;
            sellerKzteAccount: string;
            escrowShareAccount: string;
            listingId: string;
            sellerEnergyUserId: string;
            buyerEnergyUserId: string | null;
            sellerWalletAddress: string;
            totalPriceKzte: number;
            createListingTx: string | null;
            fillListingTx: string | null;
        };
    }>;
    fillDemoListing(params: {
        energyUserId: string;
        listingId: string;
    }): Promise<{
        buyerWallet: string;
        buyerShareAccount: string;
        tx: string;
        db: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("prisma/generated/client").$Enums.EnergyOtcListingStatus;
            energyAssetId: string;
            assetId: string;
            assetPda: string;
            shareMintAddress: string;
            pricePerShareKzte: number;
            shareAmount: number;
            listingPda: string;
            sellerShareAccount: string;
            sellerKzteAccount: string;
            escrowShareAccount: string;
            listingId: string;
            sellerEnergyUserId: string;
            buyerEnergyUserId: string | null;
            sellerWalletAddress: string;
            totalPriceKzte: number;
            createListingTx: string | null;
            fillListingTx: string | null;
        };
    }>;
    listOpenListings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("prisma/generated/client").$Enums.EnergyOtcListingStatus;
        energyAssetId: string;
        assetId: string;
        assetPda: string;
        shareMintAddress: string;
        pricePerShareKzte: number;
        shareAmount: number;
        listingPda: string;
        sellerShareAccount: string;
        sellerKzteAccount: string;
        escrowShareAccount: string;
        listingId: string;
        sellerEnergyUserId: string;
        buyerEnergyUserId: string | null;
        sellerWalletAddress: string;
        totalPriceKzte: number;
        createListingTx: string | null;
        fillListingTx: string | null;
    }[]>;
}
