import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller({ path: 'metrics', version: VERSION_NEUTRAL })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const ip = req.ip ?? req.socket?.remoteAddress ?? '';
    const normalized = ip.replace(/^::ffff:/, '');

    const isInternal =
      normalized === '127.0.0.1' ||
      normalized === '::1' ||
      normalized.startsWith('10.') ||
      normalized.startsWith('172.') ||
      normalized.startsWith('192.168.');

    if (!isInternal) {
      throw new ForbiddenException('Metrics are not publicly accessible');
    }

    const metrics = await this.metricsService.registry.metrics();
    // Set content-type; NestJS (not us) sends the response so interceptors run cleanly
    res.set('Content-Type', this.metricsService.registry.contentType);
    return metrics;
  }
}
