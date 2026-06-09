import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { LoggerModule } from './common/logger/logger.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { TraceContextMiddleware } from './common/middleware/trace-context.middleware';
import { EncryptionModule } from './common/encryption/encryption.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './infrastructure/health/health.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { MfaModule } from './mfa/mfa.module';

const cwd = process.cwd();
const publicCandidate = join(cwd, 'public');
const publicPath = existsSync(publicCandidate)
  ? publicCandidate
  : join(cwd, 'apps', 'api', 'public');

const repoRoot = existsSync(join(cwd, 'pnpm-workspace.yaml'))
  ? cwd
  : join(cwd, '..', '..');

const envFilePaths = [
  join(repoRoot, '.env.local'),
  join(repoRoot, '.env'),
  join(repoRoot, 'apps', 'api', '.env.local'),
  join(repoRoot, 'apps', 'api', '.env'),
].filter((value, index, self) => self.indexOf(value) === index);

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: publicPath,
      serveRoot: '/public',
      serveStaticOptions: { index: false },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    LoggerModule,
    MetricsModule,
    HealthModule,
    PrismaModule,
    EncryptionModule,
    AuthModule,
    MfaModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceContextMiddleware, RequestLoggingMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
