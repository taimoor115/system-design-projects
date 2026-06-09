# Request & Processing Logging

Automatic request and processing job logging integrated with Loki, Grafana, Prometheus, and Promtail.

## What's Logged

### Request Logging

Automatically captures every request with:

- Timestamp
- Trace ID
- User ID
- HTTP method
- Path
- Status code
- Duration
- IP address
- User agent

### Processing Job Logging

Automatically tracks all media processing:

- Image jobs: start, completion, and failure logs
- Audio jobs: duration, status, and error tracking
- Video jobs: multi-stage processing with detailed metrics

## How To View Logs

All logs are written as JSON to `apps/api/tmp/logs/api.log` and tailed into Loki by Promtail, so Grafana can query them when you run the API with `pnpm run dev` on the host.

### LogQL Query Examples

View all API requests:

```logql
{service="multilingual-tales-api"} |= "method"
```

Filter by user:

```logql
{service="multilingual-tales-api"} | json | userId="user123"
```

View errors only:

```logql
{service="multilingual-tales-api", level="error"}
```

View video generation logs:

```logql
{service="multilingual-tales-api"} |= "VIDEO"
```

View failed jobs:

```logql
{service="multilingual-tales-api"} |= "failed" |= "status"
```

Trace request by ID:

```logql
{service="multilingual-tales-api"} |= "550e8400-e29b-41d4-a716-446655440000"
```

JSON parsing:

```logql
{service="multilingual-tales-api"} | json | duration > 1000
```

## Environment Setup

Add to `.env` or `.env.local`:

```bash
LOG_FILE_PATH=tmp/logs/api.log
LOG_LEVEL=info
```

## Prometheus Metrics Available

The API also exports Prometheus metrics for your Grafana dashboard:

```text
http_requests_total[method, route, status_code]
http_request_duration_ms[method, route, status_code]
processing_jobs_total[type, status]
processing_job_duration_ms[type, status]
processing_job_errors_total[type, error_type]
node_memory_heap_used_bytes
node_process_cpu_seconds_total
```

Access metrics at: GET /metrics.

## Grafana Dashboard Setup

### Step 1: Add Loki Data Source

1. Go to Grafana → Configuration → Data Sources
2. Click Add data source, then select Loki
3. Set URL to `http://loki:3100`
4. Click Save & Test

### Step 2: Create Dashboard

1. Click + → Dashboard → Add Panel
2. Select Loki as the data source
3. Use the LogQL queries above
4. Set auto-refresh to 5s or 10s

### Step 3: Sample Queries for Panels

Total Requests (last 24h):

```logql
{service="multilingual-tales-api"} |= "method" | stats count() as total_requests
```

Requests by User:

```logql
{service="multilingual-tales-api"} |= "method" | json | stats count() as count by userId
```

Failed Video Jobs:

```logql
{service="multilingual-tales-api"} |= "VIDEO" |= "failed" | json | stats count() as failed_videos
```

Errors Over Time:

```logql
{service="multilingual-tales-api", level="error"} | stats count() as errors
```

### Step 4: Add Prometheus Metrics Panel

1. Click Add Panel, then select Prometheus
2. Use PromQL expressions below

Request Rate:

```promql
rate(http_requests_total[5m])
```

Video Processing Success Rate:

```promql
processing_jobs_total{type="video", status="completed"} / processing_jobs_total{type="video"}
```

Average Request Duration:

```promql
rate(http_request_duration_ms_sum[5m]) / rate(http_request_duration_ms_count[5m])
```

## Trace Correlation With Trace ID

Every request and job has a unique Trace ID in the response headers.

Response header example:

```text
X-Trace-Id: 550e8400-e29b-41d4-a716-446655440000
```

Search for the same trace ID across all logs:

```logql
{service="multilingual-tales-api"} |= "550e8400-e29b-41d4-a716-446655440000"
```

## Performance Tips

- Request overhead: less than 1 ms per request
- Log retention: match Loki retention to your needs
- Sampling: consider Promtail sampling for high traffic
- Alerts: add Grafana alerts for error spikes or slow requests

## What Not Logged

For security:

- Passwords, API keys, and tokens
- Request and response bodies
- Credit card info or PII, except user IDs for tracking
- User IDs are logged for audit trails

## Troubleshooting

Logs not appearing in Grafana:

1. Check that the API is writing to `apps/api/tmp/logs/api.log`
2. Verify the Promtail container can read the mounted log file path
3. Confirm Loki is healthy and Promtail is shipping entries
4. Check logs in the API console for errors

High memory usage:

- Increase Loki retention to move old logs out
- Reduce log level to `warn` in production

Slow Grafana queries:

- Narrow the time range in the dashboard
- Use more specific LogQL filters
- Check the Prometheus scrape interval
