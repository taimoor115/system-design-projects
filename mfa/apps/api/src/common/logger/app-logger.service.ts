import { Injectable, LoggerService } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import winston, { createLogger, format, transports } from 'winston';
import { getTraceId, getUserId } from '../trace-context/trace-context';

const LEVEL_COLORS: Record<string, string> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  verbose: '\x1b[35m',
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';

function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`;
  }
  if (value instanceof Error) return value.stack ?? value.message;
  if (value == null) return '';

  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

const devFormat = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, context, traceId, trace }) => {
    const color = LEVEL_COLORS[level] ?? '';
    const lvlTag = `${color}${BOLD}${level.toUpperCase().padEnd(7)}${RESET}`;
    const ts = `${DIM}${safeString(timestamp)}${RESET}`;
    const ctx = context ? ` ${GREEN}[${safeString(context)}]${RESET}` : '';
    const tid =
      traceId && traceId !== '-'
        ? ` ${DIM}traceId=${safeString(traceId)}${RESET}`
        : '';
    const stack = trace ? `\n${DIM}${safeString(trace)}${RESET}` : '';
    return `${ts} ${lvlTag}${ctx} ${safeString(message)}${tid}${stack}`;
  }),
);

const prodFormat = format.combine(
  format.timestamp({ format: () => new Date().toISOString() }),
  format.errors({ stack: true }),
  format.json(),
);

export const logFilePath =
  process.env.LOG_FILE_PATH ?? join(process.cwd(), 'tmp', 'logs', 'api.log');
export const logDir = dirname(logFilePath);

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly ignoredContexts: Set<string>;

  constructor() {
    const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';
    const ignoredContexts = (
      process.env.LOG_IGNORED_CONTEXTS ??
      // 'InstanceLoader,RouterExplorer,RoutesResolver,NestFactory,NestApplication'
      ''
    )
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    this.ignoredContexts = new Set(ignoredContexts);
    const transportsList: winston.transport[] = [new transports.Console()];

    if (isDev) {
      transportsList.push(
        new transports.File({
          filename: logFilePath,
          format: prodFormat,
          level: process.env.LOG_LEVEL ?? 'info',
          maxsize: parseInt(
            process.env.LOG_FILE_MAX_SIZE_BYTES ?? '10485760',
            10,
          ),
          maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES ?? '5', 10),
        }),
      );
    }

    this.logger = createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: isDev ? devFormat : prodFormat,
      defaultMeta: { service: 'multilingual-tales-api' },
      transports: transportsList,
    });
  }

  private meta(context?: string): Record<string, unknown> {
    return {
      ...(context ? { context } : {}),
      traceId: getTraceId(),
      ...(getUserId() ? { userId: getUserId() } : {}),
    };
  }

  private shouldSkip(message: unknown, context?: string): boolean {
    if (context && this.ignoredContexts.has(context)) return true;

    const text = safeString(message);
    if (
      context === 'NestApplication' &&
      (text.includes('InstanceLoader') || text.includes('RoutesResolver'))
    ) {
      return true;
    }

    return false;
  }

  log(message: unknown, context?: string): void {
    if (this.shouldSkip(message, context)) return;
    this.logger.info(safeString(message), this.meta(context));
  }

  error(message: unknown, trace?: unknown, context?: string): void {
    if (this.shouldSkip(message, context)) return;
    this.logger.error(safeString(message), {
      ...this.meta(context),
      ...(trace ? { trace: safeString(trace) } : {}),
    });
  }

  warn(message: unknown, context?: string): void {
    if (this.shouldSkip(message, context)) return;
    this.logger.warn(safeString(message), this.meta(context));
  }

  debug(message: unknown, context?: string): void {
    if (this.shouldSkip(message, context)) return;
    this.logger.debug(safeString(message), this.meta(context));
  }

  verbose(message: unknown, context?: string): void {
    if (this.shouldSkip(message, context)) return;
    this.logger.verbose(safeString(message), this.meta(context));
  }
}
