import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
