import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MfaPendingGuard extends AuthGuard('jwt-mfa-pending') {}
