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