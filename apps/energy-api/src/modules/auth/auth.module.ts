import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '@/modules/users/users.module';
import { DekycIntegrationModule } from '@/modules/dekyc-integration/dekyc-integration.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    DekycIntegrationModule,
    JwtModule.register({
      secret: process.env.ENERGY_JWT_SECRET ?? 'energy-local-dev-secret',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}