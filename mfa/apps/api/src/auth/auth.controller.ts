import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MfaPendingGuard } from './guards/mfa-pending.guard';

const ValidateMfaSchema = z.object({
  code: z.string().min(1).max(10),
});
class ValidateMfaDto extends createZodDto(ValidateMfaSchema) {}

interface RequestWithUser extends Request {
  user: { userId: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
  ): Promise<
    { accessToken: string } | { requiresMfa: true; mfaToken: string }
  > {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @Request() req: RequestWithUser,
  ): Promise<{ twoFactorEnabled: boolean }> {
    return this.authService.getMe(req.user.userId);
  }

  @Post('mfa/validate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MfaPendingGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  validateMfa(
    @Request() req: RequestWithUser,
    @Body() dto: ValidateMfaDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.validateMfaAndIssueToken(req.user.userId, dto.code);
  }
}
