import compression from 'compression';

import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { ZodValidationExceptionFilter } from './common/filters/zod-validation-exception.filter';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { AppLogger } from './common/logger/app-logger.service';

type SwaggerResponse = {
  headers?: Record<string, unknown>;
  [key: string]: unknown;
};

type SwaggerOperation = {
  responses?: Record<string, SwaggerResponse>;
  [key: string]: unknown;
};

type SwaggerPaths = Record<string, Record<string, SwaggerOperation>>;
type SwaggerDocument = { paths?: SwaggerPaths };

async function bootstrap() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_MFA_PENDING_SECRET',
    'ENCRYPTION_KEY',
    'APP_NAME',
  ];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(AppLogger);
  app.useLogger(logger);
  const configService = app.get(ConfigService);

  app.use(
    ['/api-docs'],
    basicAuth({
      challenge: true,
      users: {
        admin: configService.get<string>('SWAGGER_PASSWORD') ?? 'admin',
      },
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: ['api-docs', 'metrics', 'health/live', 'health/ready'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('MFA Demo API')
    .setDescription('API documentation for the MFA authentication demo')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication — register, login, MFA validate')
    .addTag('mfa', 'MFA management — setup, confirm, disable')
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config);
  const document = rawDocument as unknown as SwaggerDocument;

  if (document.paths) {
    for (const pathItem of Object.values(document.paths)) {
      for (const methodKey of Object.keys(pathItem)) {
        const op = pathItem[methodKey] as SwaggerOperation | undefined;
        if (!op?.responses) continue;
        for (const statusKey of Object.keys(op.responses)) {
          const resp = op.responses[statusKey] as SwaggerResponse;
          resp.headers = resp.headers ?? {};
          resp.headers['X-Response-Time'] = {
            description: 'Response time in milliseconds',
            schema: { type: 'string', example: '12ms' },
          };
        }
      }
    }
  }

  SwaggerModule.setup('/api-docs', app, rawDocument);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ZodValidationExceptionFilter());
  app.useGlobalInterceptors(new ResponseTimeInterceptor());

  app.enableCors();
  await app.listen(configService.get<number>('PORT') ?? 3003);
}

void bootstrap();
