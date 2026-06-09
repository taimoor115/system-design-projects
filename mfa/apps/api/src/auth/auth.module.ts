import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MfaModule } from '../mfa/mfa.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtMfaPendingStrategy } from './strategies/jwt-mfa-pending.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => MfaModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtMfaPendingStrategy],
  exports: [AuthService, JwtStrategy, JwtMfaPendingStrategy],
})
export class AuthModule {}
