import { PrismaService } from '@/modules/prisma/prisma.service';
import { CurrentUser } from './current-user.type';
import { AuthMeResponseDto } from '@/modules/auth/dto/auth-me.response.dto';
import { WalletsService } from '@/modules/wallets/wallets.service';
export declare class UsersService {
    private readonly prisma;
    private readonly walletsService;
    constructor(prisma: PrismaService, walletsService: WalletsService);
    findById(id: string): Promise<CurrentUser | null>;
    getMeView(id: string): Promise<AuthMeResponseDto | null>;
    findOrCreateFromDekycEnvelope(params: {
        dekycUserId: string;
        claims: Record<string, unknown> | null | undefined;
    }): Promise<CurrentUser>;
    private mapToCurrentUser;
}
