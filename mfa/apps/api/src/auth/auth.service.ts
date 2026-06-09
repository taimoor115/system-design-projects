import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { MfaService } from '../mfa/mfa.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type LoginResult =
  | { accessToken: string }
  | { requiresMfa: true; mfaToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => MfaService))
    private readonly mfaService: MfaService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.create({ data: { email: dto.email, password } });

    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.twoFactorEnabled) {
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'access' },
        { secret: process.env.JWT_SECRET, expiresIn: '7d' },
      );
      return { accessToken };
    }

    const mfaToken = this.jwtService.sign(
      { sub: user.id, type: 'mfa_pending' },
      { secret: process.env.JWT_MFA_PENDING_SECRET, expiresIn: '3m' },
    );
    return { requiresMfa: true, mfaToken };
  }

  async getMe(userId: string): Promise<{ twoFactorEnabled: boolean }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return { twoFactorEnabled: user.twoFactorEnabled };
  }

  async validateMfaAndIssueToken(
    userId: string,
    code: string,
  ): Promise<{ accessToken: string }> {
    const totpValid = await this.mfaService.validateCode(userId, code);
    if (!totpValid) {
      const recoveryValid = await this.mfaService.validateRecoveryCode(
        userId,
        code,
      );
      if (!recoveryValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    );
    return { accessToken };
  }
}
