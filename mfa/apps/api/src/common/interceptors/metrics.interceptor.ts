import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../infrastructure/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const method = req.method;

    return next.handle().pipe(
      tap(() => {
        // Use the Express route pattern (/users/:id) to avoid high cardinality
        const route: string =
          (req.route as { path?: string } | undefined)?.path ??
          req.path ??
          'unknown';
        const statusCode = String(res.statusCode);
        const durationMs = Date.now() - start;

        this.metricsService.httpRequestsTotal
          .labels(method, route, statusCode)
          .inc();
        this.metricsService.httpRequestDurationMs
          .labels(method, route, statusCode)
          .observe(durationMs);
      }),
    );
  }
}
