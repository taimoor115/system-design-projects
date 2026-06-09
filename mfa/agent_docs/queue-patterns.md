# Queue Patterns

Stack: BullMQ · Redis (separate connection from shared Redis client)

## Structure

- Queue definitions live in `queues/` — one file per queue
- Processors live in `queues/processors/` — one file per processor
- `QUEUE_IMAGE` is the primary async queue for image/AI/TTS work

## Rules

- Always dispatch via the queue — never call processor functions directly
- Processors must be idempotent — jobs can be retried
- Use `Promise.allSettled` for batch operations — partial failure must not kill the job
- Per-item retry with exponential backoff for external API calls (Gemini, TTS)
- On final failure: persist failure reason + failed item IDs to DB so re-processing is possible without re-running successful items

## Concurrency Settings (current)

- Gemini API batch concurrency: `BATCH_CONCURRENCY = 3` (p-limit)
- S3 upload concurrency: `UPLOAD_CONCURRENCY = 5`
- DB writes: bulk insert, never per-item

## Circuit Breaker

Gemini calls use `opossum` circuit breaker. Do not bypass it with direct API calls.

## Anti-Patterns

- Do not do image, TTS, or AI work inline in a service or controller
- Do not use the shared Redis client for BullMQ — it has its own connection
- Do not throw unhandled errors in processors without persisting the failure reason
