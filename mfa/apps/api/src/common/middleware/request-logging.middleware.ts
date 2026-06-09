import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { RequestLogService } from '../logger/request-log.service';
import { MetricsService } from 'src/infrastructure/metrics/metrics.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly ignoredPaths = new Set(['/metrics']);

  constructor(
    private readonly requestLogService: RequestLogService,
    @Inject(MetricsService) private readonly metricsService: MetricsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const normalizedPath = this.normalizePath(req.path);
      const shouldSkipLogging =
        this.ignoredPaths.has(req.path) ||
        this.ignoredPaths.has(normalizedPath);

      if (!shouldSkipLogging) {
        this.requestLogService.logRequest({
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          ip:
            (req.headers['x-forwarded-for'] as string) ||
            req.socket.remoteAddress ||
            'unknown',
          userAgent: req.headers['user-agent'],
        });

        this.metricsService.httpRequestsTotal.inc({
          method: req.method,
          route: normalizedPath,
          status_code: String(res.statusCode),
        });

        this.metricsService.httpRequestDurationMs.observe(
          {
            method: req.method,
            route: normalizedPath,
            status_code: String(res.statusCode),
          },
          duration,
        );
      }
    });

    next();
  }

  private normalizePath(path: string): string {
    return path
      .split('/')
      .map((segment) => (segment.match(/^[0-9a-f-]+$/i) ? ':id' : segment))
      .join('/');
  }
}
