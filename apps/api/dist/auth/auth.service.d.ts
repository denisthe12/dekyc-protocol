import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
    }>;
    getProfileSummary(userId: string): Promise<{
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
    setupBiometric(userId: string, biometricMockId: string): Promise<{
        id: string;
        updatedAt: Date;
        biometricConfigured: boolean;
        biometricMockId: string | null;
    }>;
    issueLoginCode(userId: string): Promise<{
        loginCode: string;
        issuedAt: string;
    }>;
    rotateLoginCode(userId: string): Promise<{
        loginCode: string;
        issuedAt: string;
    }>;
    getKycSummary(userId: string): Promise<{
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
    getUserOverview(userId: string): Promise<{
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
    private generateLoginCode;
    private hashLoginCode;
    private issueAuthResult;
}
