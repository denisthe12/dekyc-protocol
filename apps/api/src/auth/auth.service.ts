import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtUserPayload } from './auth.types';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password.trim();

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
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

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password.trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, password);

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthResult(user.id, user.email);
  }

  async getMe(userId: string) {
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
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getProfileSummary(userId: string) {
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
      throw new UnauthorizedException('User not found');
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

  async setupBiometric(userId: string, biometricMockId: string) {
    const normalized = biometricMockId.trim();

    if (!normalized) {
      throw new BadRequestException('biometricMockId is required');
    }

    if (normalized.length < 4) {
      throw new BadRequestException('biometricMockId must be at least 4 characters');
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

  async issueLoginCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        biometricConfigured: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.biometricConfigured) {
      throw new BadRequestException('Configure biometric mock before issuing login code');
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

  async rotateLoginCode(userId: string) {
    return this.issueLoginCode(userId);
  }

    async getKycSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        biometricConfigured: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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

  private generateLoginCode(): string {
    return `DK-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private hashLoginCode(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private issueAuthResult(userId: string, email: string) {
    const payload: JwtUserPayload = {
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
}