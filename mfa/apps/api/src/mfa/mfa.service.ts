import { BadRequestException, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../common/encryption/encryption.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MfaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async generateSecret(userId: string): Promise<{
    base32Secret: string;
    otpUri: string;
    qrCodeDataUrl: string;
  }> {
    const base32Secret = authenticator.generateSecret();
    const appName = process.env.APP_NAME ?? 'MFADemo';
    const otpUri = authenticator.keyuri(userId, appName, base32Secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpUri);

    const encrypted = this.encryption.encrypt(base32Secret);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pendingTwoFactorSecret: encrypted },
    });

    return { base32Secret, otpUri, qrCodeDataUrl };
  }

  async confirmSetup(
    userId: string,
    code: string,
  ): Promise<{ recoveryCodes: string[] }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.pendingTwoFactorSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    const secret = this.encryption.decrypt(user.pendingTwoFactorSecret);
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      throw new BadRequestException('Invalid code. Please try again.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: user.pendingTwoFactorSecret,
        twoFactorEnabled: true,
        pendingTwoFactorSecret: null,
      },
    });

    const recoveryCodes = await this.generateRecoveryCodes(userId);
    return { recoveryCodes };
  }

  async validateCode(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.twoFactorSecret) {
      throw new BadRequestException('MFA not configured for this user');
    }

    const secret = this.encryption.decrypt(user.twoFactorSecret);
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      return false;
    }

    const currentTimeStep = Math.floor(Date.now() / 1000 / 30);
    if (
      user.lastUsedTotpStep !== null &&
      user.lastUsedTotpStep !== undefined &&
      currentTimeStep <= user.lastUsedTotpStep
    ) {
      return false;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastUsedTotpStep: currentTimeStep },
    });

    return true;
  }

  async generateRecoveryCodes(userId: string): Promise<string[]> {
    const plainCodes: string[] = [];

    for (let i = 0; i < 8; i++) {
      plainCodes.push(crypto.randomBytes(5).toString('hex'));
    }

    await this.prisma.recoveryCode.deleteMany({ where: { userId } });

    const hashed = await Promise.all(
      plainCodes.map((code) => bcrypt.hash(code, 12)),
    );

    await this.prisma.recoveryCode.createMany({
      data: hashed.map((codeHash) => ({ userId, codeHash, isUsed: false })),
    });

    return plainCodes;
  }

  async validateRecoveryCode(userId: string, code: string): Promise<boolean> {
    const codes = await this.prisma.recoveryCode.findMany({
      where: { userId, isUsed: false },
    });

    for (const stored of codes) {
      const match = await bcrypt.compare(code, stored.codeHash);
      if (match) {
        await this.prisma.recoveryCode.update({
          where: { id: stored.id },
          data: { isUsed: true },
        });
        return true;
      }
    }

    return false;
  }

  async disableMfa(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastUsedTotpStep: null,
      },
    });
    await this.prisma.recoveryCode.deleteMany({ where: { userId } });
  }
}
