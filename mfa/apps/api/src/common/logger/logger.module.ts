import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { RequestLogService } from './request-log.service';

@Global()
@Module({
  providers: [AppLogger, RequestLogService],
  exports: [AppLogger, RequestLogService],
})
export class LoggerModule {}
