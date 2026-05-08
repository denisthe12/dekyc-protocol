import { JwtService } from '@nestjs/jwt';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { UsersService } from '@/modules/users/users.service';
import { DekycClientService } from '@/modules/dekyc-integration/dekyc-client.service';
import { DekycConnectExchangeDto } from './dto/dekyc-connect-exchange.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly usersService;
    private readonly dekycClientService;
    constructor(jwtService: JwtService, usersService: UsersService, dekycClientService: DekycClientService);
    loginViaDekycServer(dto: DekycLoginDto): Promise<{
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
    private finalizeDekycLogin;
    loginViaDekycConnect(dto: DekycConnectExchangeDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            dekycUserId: string;
            email: string | null;
            fullName: string | null;
            role: import("prisma/generated/client").$Enums.EnergyUserRole;
        };
        dekycConnect: {
            assertionId: string;
            consentId: string;
            serviceSubjectId: string;
            consentReceiptHash: string;
            assertionExpiresAt: string;
        };
    }>;
}
