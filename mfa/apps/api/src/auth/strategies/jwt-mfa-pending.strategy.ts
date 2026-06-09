import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface MfaPendingPayload {
  sub: string;
  type: string;
}

@Injectable()
export class JwtMfaPendingStrategy extends PassportStrategy(
  Strategy,
  'jwt-mfa-pending',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_MFA_PENDING_SECRET ?? '',
    });
  }

  validate(payload: MfaPendingPayload): { userId: string } {
    if (payload.type !== 'mfa_pending') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { userId: payload.sub };
  }
}
