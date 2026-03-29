import { AuthService } from './auth.service';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { CurrentUser } from '@/modules/users/current-user.type';
import { UsersService } from '@/modules/users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    loginViaDekyc(dto: DekycLoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            dekycUserId: string;
            email: string | null;
            fullName: string | null;
            role: import("prisma/generated/client").$Enums.EnergyUserRole;
        };
    }>;
    loginViaDekycCallback(dto: DekycLoginCallbackDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            dekycUserId: string;
            email: string | null;
            fullName: string | null;
            role: import("prisma/generated/client").$Enums.EnergyUserRole;
        };
    }>;
    getMe(user: CurrentUser): Promise<import("./dto/auth-me.response.dto").AuthMeResponseDto>;
}
