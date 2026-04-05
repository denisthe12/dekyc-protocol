import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { HkdfService } from '../crypto/hkdf.service';
import { SolanaService } from '../solana/solana.service';
import { SetupBiometricDto } from './dto/setup-biometric.dto';
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
    profileSummary(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        profileStatus: {
            biometricConfigured: boolean;
            biometricMockId: string | null;
            loginCodeConfigured: boolean;
            loginCodeIssuedAt: Date | null;
            edsBound: boolean;
            kycReady: boolean;
            vaultReady: boolean;
        };
        latestUserCert: {
            id: string;
            createdAt: Date;
        } | null;
        latestKycProfile: {
            gender: string | null;
            id: string;
            fullName: string | null;
            iin: string | null;
            email: string | null;
            birthDate: string | null;
            createdAt: Date;
            country: string | null;
            status: string;
        } | null;
        latestVaultEntry: {
            id: string;
            createdAt: Date;
            keyVersion: string;
            algorithm: string;
        } | null;
    }>;
    setupBiometric(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }, body: SetupBiometricDto): Promise<{
        id: string;
        updatedAt: Date;
        biometricConfigured: boolean;
        biometricMockId: string | null;
    }>;
    issueLoginCode(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        loginCode: string;
        issuedAt: string;
    }>;
    rotateLoginCode(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        loginCode: string;
        issuedAt: string;
    }>;
    kycSummary(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        gating: {
            biometricConfigured: boolean;
            canBindEds: boolean;
        };
        eds: {
            connected: boolean;
            latestUserCert: {
                id: string;
                createdAt: Date;
            } | null;
        };
        kyc: {
            ready: boolean;
            profile: {
                gender: string | null;
                id: string;
                fullName: string | null;
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
                iin: string | null;
                email: string | null;
                birthDate: string | null;
                createdAt: Date;
                country: string | null;
                status: string;
            } | null;
        };
        vault: {
            ready: boolean;
            entry: {
                id: string;
                createdAt: Date;
                keyVersion: string;
                algorithm: string;
            } | null;
        };
    }>;
    userOverview(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
            createdAt: Date;
        };
        onboarding: {
            completedSteps: number;
            totalSteps: number;
            readyForServiceLogin: boolean;
        };
        status: {
            biometricConfigured: boolean;
            biometricMockId: string | null;
            loginCodeConfigured: boolean;
            loginCodeIssuedAt: Date | null;
            edsBound: boolean;
            kycReady: boolean;
            vaultReady: boolean;
            activePermissionsCount: number;
        };
        latestKycProfile: {
            id: string;
            fullName: string | null;
            iin: string | null;
            createdAt: Date;
        } | null;
        latestUserCert: {
            id: string;
            createdAt: Date;
        } | null;
        latestVaultEntry: {
            id: string;
            createdAt: Date;
            algorithm: string;
        } | null;
    }>;
}
