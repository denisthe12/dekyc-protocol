"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2 = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const email = dto.email.trim().toLowerCase();
        const password = dto.password.trim();
        if (!email || !password) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        if (password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.BadRequestException('User already exists');
        }
        const passwordHash = await argon2.hash(password);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                emailVerified: true,
            },
        });
        return this.issueAuthResult(user.id, user.email);
    }
    async login(dto) {
        const email = dto.email.trim().toLowerCase();
        const password = dto.password.trim();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.issueAuthResult(user.id, user.email);
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async getProfileSummary(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                biometricConfigured: true,
                biometricMockId: true,
                loginCodeHash: true,
                loginCodeIssuedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const latestUserCert = await this.prisma.userCert.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
            },
        });
        const latestKycProfile = await this.prisma.kycProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                iin: true,
                birthDate: true,
                gender: true,
                country: true,
                email: true,
                status: true,
                createdAt: true,
            },
        });
        const latestVaultEntry = await this.prisma.kycVaultEntry.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                algorithm: true,
                keyVersion: true,
                createdAt: true,
            },
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            profileStatus: {
                biometricConfigured: user.biometricConfigured,
                biometricMockId: user.biometricMockId,
                loginCodeConfigured: Boolean(user.loginCodeHash),
                loginCodeIssuedAt: user.loginCodeIssuedAt,
                edsBound: Boolean(latestUserCert),
                kycReady: Boolean(latestKycProfile),
                vaultReady: Boolean(latestVaultEntry),
            },
            latestUserCert,
            latestKycProfile,
            latestVaultEntry,
        };
    }
    async setupBiometric(userId, biometricMockId) {
        const normalized = biometricMockId.trim();
        if (!normalized) {
            throw new common_1.BadRequestException('biometricMockId is required');
        }
        if (normalized.length < 4) {
            throw new common_1.BadRequestException('biometricMockId must be at least 4 characters');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                biometricConfigured: true,
                biometricMockId: normalized,
            },
            select: {
                id: true,
                biometricConfigured: true,
                biometricMockId: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async issueLoginCode(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                biometricConfigured: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.biometricConfigured) {
            throw new common_1.BadRequestException('Configure biometric mock before issuing login code');
        }
        const loginCode = this.generateLoginCode();
        const loginCodeHash = this.hashLoginCode(loginCode);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginCodeHash,
                loginCodeIssuedAt: new Date(),
            },
        });
        return {
            loginCode,
            issuedAt: new Date().toISOString(),
        };
    }
    async rotateLoginCode(userId) {
        return this.issueLoginCode(userId);
    }
    async getKycSummary(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                biometricConfigured: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const latestUserCert = await this.prisma.userCert.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
            },
        });
        const latestKycProfile = await this.prisma.kycProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                fullName: true,
                iin: true,
                email: true,
                birthDate: true,
                gender: true,
                country: true,
                status: true,
                createdAt: true,
            },
        });
        const latestVaultEntry = await this.prisma.kycVaultEntry.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                algorithm: true,
                keyVersion: true,
                createdAt: true,
            },
        });
        return {
            gating: {
                biometricConfigured: user.biometricConfigured,
                canBindEds: user.biometricConfigured,
            },
            eds: {
                connected: Boolean(latestUserCert),
                latestUserCert,
            },
            kyc: {
                ready: Boolean(latestKycProfile),
                profile: latestKycProfile,
            },
            vault: {
                ready: Boolean(latestVaultEntry),
                entry: latestVaultEntry,
            },
        };
    }
    async getUserOverview(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                biometricConfigured: true,
                biometricMockId: true,
                loginCodeHash: true,
                loginCodeIssuedAt: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const latestUserCert = await this.prisma.userCert.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
            },
        });
        const latestKycProfile = await this.prisma.kycProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                iin: true,
                createdAt: true,
            },
        });
        const latestVaultEntry = await this.prisma.kycVaultEntry.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                algorithm: true,
                createdAt: true,
            },
        });
        const activePermissionsCount = await this.prisma.permission.count({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });
        const completedSteps = [
            user.emailVerified,
            user.biometricConfigured,
            Boolean(user.loginCodeHash),
            Boolean(latestUserCert),
            Boolean(latestKycProfile),
            Boolean(latestVaultEntry),
        ].filter(Boolean).length;
        return {
            user: {
                id: user.id,
                email: user.email,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
            },
            onboarding: {
                completedSteps,
                totalSteps: 6,
                readyForServiceLogin: user.biometricConfigured &&
                    Boolean(user.loginCodeHash) &&
                    Boolean(latestKycProfile),
            },
            status: {
                biometricConfigured: user.biometricConfigured,
                biometricMockId: user.biometricMockId,
                loginCodeConfigured: Boolean(user.loginCodeHash),
                loginCodeIssuedAt: user.loginCodeIssuedAt,
                edsBound: Boolean(latestUserCert),
                kycReady: Boolean(latestKycProfile),
                vaultReady: Boolean(latestVaultEntry),
                activePermissionsCount,
            },
            latestKycProfile,
            latestUserCert,
            latestVaultEntry,
        };
    }
    generateLoginCode() {
        return `DK-${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
    }
    hashLoginCode(value) {
        return (0, crypto_1.createHash)('sha256').update(value).digest('hex');
    }
    issueAuthResult(userId, email) {
        const payload = {
            sub: userId,
            email,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: userId,
                email,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map