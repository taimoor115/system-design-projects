import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
