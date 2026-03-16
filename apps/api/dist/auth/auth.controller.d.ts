import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { HkdfService } from '../crypto/hkdf.service';
import { SolanaService } from '../solana/solana.service';
export declare class AuthController {
    private readonly authService;
    private readonly hkdfService;
    private readonly solanaService;
    constructor(authService: AuthService, hkdfService: HkdfService, solanaService: SolanaService);
    signup(body: SignupDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    login(body: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    me(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
    }>;
    testHkdf(): {
        permissionKey: string;
    };
    solanaDebug(): {
        programId: string;
        wallet: string;
    };
    solanaRegisterUser(req: any): Promise<{
        tx: string;
        userPda: string;
        message: string;
    }>;
}
