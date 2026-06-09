import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { traceStorage } from '../trace-context/trace-context';

@Injectable()
export class TraceContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const traceId =
      (req.headers['x-trace-id'] as string | undefined) ?? randomUUID();
    res.setHeader('X-Trace-Id', traceId);
    traceStorage.run({ traceId }, next);
  }
}
