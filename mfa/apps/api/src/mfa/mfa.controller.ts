import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfirmMfaDto } from './dto/confirm-mfa.dto';
import { MfaService } from './mfa.service';

interface RequestWithUser extends Request {
  user: { userId: string };
}

@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('setup')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  setup(@Request() req: RequestWithUser): Promise<{
    otpUri: string;
    qrCodeDataUrl: string;
    base32Secret: string;
  }> {
    return this.mfaService.generateSecret(req.user.userId);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(
    @Request() req: RequestWithUser,
    @Body() dto: ConfirmMfaDto,
  ): Promise<{ recoveryCodes: string[] }> {
    return this.mfaService.confirmSetup(req.user.userId, dto.code);
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disable(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.mfaService.disableMfa(req.user.userId);
    return { message: 'MFA disabled successfully' };
  }
}
