import { PrismaService } from '@/modules/prisma/prisma.service';
import { CurrentUser } from './current-user.type';
import { AuthMeResponseDto } from '@/modules/auth/dto/auth-me.response.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<CurrentUser | null>;
    getMeView(id: string): Promise<AuthMeResponseDto | null>;
    findOrCreateFromDekycEnvelope(params: {
        dekycUserId: string;
        claims: Record<string, unknown> | null | undefined;
    }): Promise<CurrentUser>;
    private mapToCurrentUser;
    private generateWalletAddress;
}
