import { EnergyUserRole, EnergyWalletStatus } from '../../../../prisma/generated/client';
export declare class AuthMeResponseDto {
    id: string;
    dekycUserId: string;
    email: string | null;
    fullName: string | null;
    role: EnergyUserRole;
    profile: {
        iin: string | null;
        birthDate: string | null;
        verified: boolean;
        age18Plus: boolean;
    } | null;
    wallet: {
        custodialWalletAddress: string;
        kzteTokenAccountAddress: string | null;
        energyPointsAccountAddress: string | null;
        walletStatus: EnergyWalletStatus;
        initialKzteAirdropped: boolean;
        initialKzteAirdropTx: string | null;
    } | null;
    latestDekycConnectLogin: {
        id: string;
        assertionId: string;
        consentId: string;
        serviceSubjectId: string;
        consentReceiptHash: string;
        assertionExpiresAt: string;
        createdAt: string;
    } | null;
}
