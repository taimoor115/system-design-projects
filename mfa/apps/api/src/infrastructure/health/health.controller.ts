import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok', timestamp: new Date() };
  }

  @Get('ready')
  async ready() {
    const result: { database: string } = { database: 'unknown' };

    try {
      await this.prisma.user.findFirst({ take: 1 });
      result.database = 'up';
    } catch (err) {
      this.logger.error('Database health check failed', err);
      result.database = 'down';
    }

    return {
      status: result.database === 'up' ? 'ok' : 'degraded',
      services: result,
      timestamp: new Date(),
    };
  }
}
