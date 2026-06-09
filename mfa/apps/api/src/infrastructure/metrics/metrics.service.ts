import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [this.registry],
  });

  readonly httpRequestDurationMs = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [this.registry],
  });

  readonly authLoginAttemptsTotal = new Counter({
    name: 'auth_login_attempts_total',
    help: 'Total number of authentication login attempts',
    labelNames: ['success'] as const,
    registers: [this.registry],
  });

  readonly presignedUrlGenerationsTotal = new Counter({
    name: 'presigned_url_generations_total',
    help: 'Total number of presigned URL generation attempts',
    labelNames: ['success'] as const,
    registers: [this.registry],
  });

  readonly jobsTotal = new Counter({
    name: 'jobs_total',
    help: 'Total number of jobs created',
    labelNames: ['status'] as const,
    registers: [this.registry],
  });

  readonly jobProgressUpdated = new Counter({
    name: 'job_progress_updated_total',
    help: 'Total number of job progress updates',
    labelNames: [] as const,
    registers: [this.registry],
  });

  readonly jobStatusApiCalls: Counter<'status_code'> = new Counter({
    name: 'job_status_api_calls_total',
    help: 'Total number of job status API calls',
    labelNames: ['status_code'] as const,
    registers: [this.registry],
  });

  readonly jobDownloadApiCalls: Counter<'success'> = new Counter({
    name: 'job_download_api_calls_total',
    help: 'Total number of job download API calls',
    labelNames: ['success'] as const,
    registers: [this.registry],
  });

  readonly processingJobsTotal = new Counter({
    name: 'processing_jobs_total',
    help: 'Total processing jobs by type and status',
    labelNames: ['type', 'status'] as const,
    registers: [this.registry],
  });

  readonly processingJobDurationMs = new Histogram({
    name: 'processing_job_duration_ms',
    help: 'Processing job duration in milliseconds',
    labelNames: ['type', 'status'] as const,
    buckets: [1000, 5000, 10000, 30000, 60000, 120000, 300000, 600000],
    registers: [this.registry],
  });

  readonly processingJobErrorsTotal = new Counter({
    name: 'processing_job_errors_total',
    help: 'Total processing job errors by type',
    labelNames: ['type', 'error_type'] as const,
    registers: [this.registry],
  });

  readonly dbQueriesTotal = new Counter({
    name: 'db_queries_total',
    help: 'Total number of database queries by status',
    labelNames: ['status'] as const,
    registers: [this.registry],
  });

  readonly dbQueryDurationMs = new Histogram({
    name: 'db_query_duration_ms',
    help: 'Database query duration in milliseconds',
    labelNames: ['status'] as const,
    buckets: [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [this.registry],
  });

  readonly assetCleanupRunsTotal = new Counter({
    name: 'asset_cleanup_runs_total',
    help: 'Total asset cleanup cron runs by outcome',
    labelNames: ['status'] as const,
    registers: [this.registry],
  });

  readonly assetCleanupJobsProcessedTotal = new Counter({
    name: 'asset_cleanup_jobs_processed_total',
    help: 'Total expired jobs processed by the asset cleanup cron',
    labelNames: [] as const,
    registers: [this.registry],
  });

  readonly assetCleanupS3DeletedTotal = new Counter({
    name: 'asset_cleanup_s3_objects_deleted_total',
    help: 'Total S3 objects deleted by asset cleanup, by asset type',
    labelNames: ['asset_type'] as const,
    registers: [this.registry],
  });

  readonly assetCleanupDurationMs = new Histogram({
    name: 'asset_cleanup_duration_ms',
    help: 'Asset cleanup cron run duration in milliseconds',
    labelNames: [] as const,
    buckets: [1000, 5000, 10000, 30000, 60000, 120000, 300000],
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.registry, prefix: 'node_' });
  }
}
