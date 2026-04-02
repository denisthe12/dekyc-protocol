import { PrismaService } from '@/modules/prisma/prisma.service';
import { CurrentUser } from './current-user.type';
import { AuthMeResponseDto } from '@/modules/auth/dto/auth-me.response.dto';
import { WalletsService } from '@/modules/wallets/wallets.service';
import { SolanaService } from '../solana/solana.service';
import { EnergyPointsService } from '../solana/energy-points.service';
export declare class UsersService {
    private readonly prisma;
    private readonly walletsService;
    private readonly solanaService;
    private readonly energyPointsService;
    constructor(prisma: PrismaService, walletsService: WalletsService, solanaService: SolanaService, energyPointsService: EnergyPointsService);
    findById(id: string): Promise<CurrentUser | null>;
    getMeView(id: string): Promise<AuthMeResponseDto | null>;
    findOrCreateFromDekycEnvelope(params: {
        dekycUserId: string;
        claims: Record<string, unknown> | null | undefined;
    }): Promise<CurrentUser>;
    private mapToCurrentUser;
    getProfile(energyUserId: string): Promise<{
        user: {
            id: string;
            dekycUserId: string;
            fullName: string | null;
            email: string | null;
            iin: string | null | undefined;
            createdAt: string;
        };
        wallet: {
            custodialWalletAddress: string;
            kzteTokenAccountAddress: string | null;
            energyPointsTokenAccountAddress: string | null;
        } | null;
        balances: {
            kzte: {
                amountBaseUnits: string;
                decimals: number;
            };
            energyPoints: {
                amountBaseUnits: string;
                decimals: number;
            };
        };
        security: {
            actionPasswordIsSet: boolean;
        };
    }>;
}
