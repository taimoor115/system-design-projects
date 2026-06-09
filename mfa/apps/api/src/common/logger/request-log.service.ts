import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { getTraceId, getUserId } from '../trace-context/trace-context';
import { AppLogger } from './app-logger.service';

export interface RequestLogEntry {
  timestamp: string;
  traceId: string;
  userId?: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
  userAgent?: string;
  type?: never;
}

export interface ProcessingLogEntry {
  timestamp: string;
  traceId: string;
  userId?: string;
  type: 'image' | 'audio' | 'video';
  jobId: string;
  queue?: string;
  stage?: string;
  attempt?: number;
  bookId?: string;
  editionId?: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

@Injectable()
export class RequestLogService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly appLogger: AppLogger) {}

  private inMemoryLogs: {
    requests: RequestLogEntry[];
    processing: ProcessingLogEntry[];
  } = {
    requests: [],
    processing: [],
  };
  private readonly maxMemoryLogs = 10000;
  private readonly retentionMs =
    parseInt(process.env.LOG_RETENTION_HOURS ?? '24', 10) * 60 * 60 * 1000;
  private pruneTimer: ReturnType<typeof setInterval> | null = null;

  onModuleInit(): void {
    const pruneIntervalMs =
      parseInt(process.env.LOG_PRUNE_INTERVAL_MINUTES ?? '10', 10) * 60 * 1000;
    this.pruneTimer = setInterval(() => this.pruneOldLogs(), pruneIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.pruneTimer) clearInterval(this.pruneTimer);
  }

  private pruneOldLogs(): void {
    const cutoff = Date.now() - this.retentionMs;
    const before =
      this.inMemoryLogs.requests.length + this.inMemoryLogs.processing.length;

    this.inMemoryLogs.requests = this.inMemoryLogs.requests.filter(
      (l) => new Date(l.timestamp).getTime() >= cutoff,
    );
    this.inMemoryLogs.processing = this.inMemoryLogs.processing.filter(
      (l) => new Date(l.timestamp).getTime() >= cutoff,
    );

    const pruned =
      before -
      this.inMemoryLogs.requests.length -
      this.inMemoryLogs.processing.length;
    if (pruned > 0) {
      this.appLogger.debug(
        `Pruned ${pruned} log entries older than ${this.retentionMs / 3600000}h`,
        'RequestLogService',
      );
    }
  }

  logRequest(entry: Omit<RequestLogEntry, 'timestamp' | 'traceId'>): void {
    const logEntry: RequestLogEntry = {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      ...(getUserId() ? { userId: getUserId() } : {}),
      ...entry,
    };

    this.addToMemory(logEntry, 'requests');
    this.appLogger.log(
      JSON.stringify({
        event: 'http_request',
        ...logEntry,
      }),
      'RequestLogService',
    );
  }

  logProcessing(
    entry: Omit<ProcessingLogEntry, 'timestamp' | 'traceId'>,
  ): void {
    const logEntry: ProcessingLogEntry = {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      ...(getUserId() ? { userId: getUserId() } : {}),
      ...entry,
    };

    this.addToMemory(logEntry, 'processing');
    this.appLogger.log(
      JSON.stringify({
        event: 'processing_job',
        ...logEntry,
      }),
      'RequestLogService',
    );
  }

  private addToMemory(
    entry: RequestLogEntry | ProcessingLogEntry,
    type: 'requests' | 'processing',
  ): void {
    if (type === 'requests') {
      this.inMemoryLogs.requests.push(entry as RequestLogEntry);
    } else {
      this.inMemoryLogs.processing.push(entry as ProcessingLogEntry);
    }

    if (this.inMemoryLogs[type].length > this.maxMemoryLogs) {
      this.inMemoryLogs[type].shift();
    }
  }

  getRequestLogs(filters?: {
    userId?: string;
    method?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): RequestLogEntry[] {
    let logs = [...this.inMemoryLogs.requests];

    if (filters?.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters?.method) {
      logs = logs.filter((log) => log.method === filters.method);
    }
    if (filters?.startTime) {
      const startTime = new Date(filters.startTime).getTime();
      logs = logs.filter(
        (log) => new Date(log.timestamp).getTime() >= startTime,
      );
    }
    if (filters?.endTime) {
      const endTime = new Date(filters.endTime).getTime();
      logs = logs.filter((log) => new Date(log.timestamp).getTime() <= endTime);
    }

    logs = logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const limit = filters?.limit ?? 1000;
    return logs.slice(0, limit);
  }

  getProcessingLogs(filters?: {
    userId?: string;
    type?: 'image' | 'audio' | 'video';
    status?: 'started' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): ProcessingLogEntry[] {
    let logs = [...this.inMemoryLogs.processing];

    if (filters?.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters?.type) {
      logs = logs.filter((log) => log.type === filters.type);
    }
    if (filters?.status) {
      logs = logs.filter((log) => log.status === filters.status);
    }
    if (filters?.startTime) {
      const startTime = new Date(filters.startTime).getTime();
      logs = logs.filter(
        (log) => new Date(log.timestamp).getTime() >= startTime,
      );
    }
    if (filters?.endTime) {
      const endTime = new Date(filters.endTime).getTime();
      logs = logs.filter((log) => new Date(log.timestamp).getTime() <= endTime);
    }

    logs = logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const limit = filters?.limit ?? 1000;
    return logs.slice(0, limit);
  }

  getLogStats(timeRangeMs: number = 86400000) {
    const now = Date.now();
    const cutoff = now - timeRangeMs;

    const requests = this.inMemoryLogs.requests.filter(
      (log) => new Date(log.timestamp).getTime() >= cutoff,
    );
    const processing = this.inMemoryLogs.processing.filter(
      (log) => new Date(log.timestamp).getTime() >= cutoff,
    );

    const userMap = new Map<string, number>();
    requests.forEach((log) => {
      if (log.userId) {
        userMap.set(log.userId, (userMap.get(log.userId) ?? 0) + 1);
      }
    });

    const processingByType = {
      image: processing.filter((p) => p.type === 'image').length,
      audio: processing.filter((p) => p.type === 'audio').length,
      video: processing.filter((p) => p.type === 'video').length,
    };

    const processingByStatus = {
      started: processing.filter((p) => p.status === 'started').length,
      completed: processing.filter((p) => p.status === 'completed').length,
      failed: processing.filter((p) => p.status === 'failed').length,
    };

    return {
      totalRequests: requests.length,
      uniqueUsers: userMap.size,
      topUsers: Array.from(userMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count })),
      processingByType,
      processingByStatus,
      avgResponseTime:
        requests.length > 0
          ? Math.round(
              requests.reduce((sum, log) => sum + log.duration, 0) /
                requests.length,
            )
          : 0,
    };
  }
}
