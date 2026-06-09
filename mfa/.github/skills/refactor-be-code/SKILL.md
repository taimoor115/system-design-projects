---
name: refactor-be-code
description: 'Refactor backend code and APIs with principal-level rigor. Use when: improving Node/NestJS/Express services, API contracts, repository patterns, SQL/query performance, security posture, reliability, and maintainability for high-traffic systems while preserving behavior.'
argument-hint: 'Share backend module/endpoints, bottlenecks, and refactor constraints'
user-invocable: true
---

# Refactor Backend Code

Refactor backend modules and APIs to improve scalability, resilience, and maintainability without unintended behavior regressions.

## Use When

- APIs are slow, inconsistent, or fragile under load.
- Service and repository responsibilities are mixed.
- Query paths are inefficient or indexes are missing.
- Security/reliability concerns appear during growth.

Trigger phrases:
- "refactor BE code"
- "optimize API"
- "clean backend architecture"
- "make this service scale"

## Refactor Workflow

## Mandatory Backend Standards

Always enforce these defaults during refactor unless user explicitly overrides:

### Structured Logging Fields

- request_id
- user_id
- endpoint
- latency
- error_code

### Metrics and Tracing

- Track and report P95 latency.
- Track and report error rate.
- Add tracing when applicable.

### N+1 Query Prevention Rule

Explicitly remove or prevent N+1 patterns using:

- joins
- batching
- dataloader pattern (if needed)

### Idempotency Rules (Critical)

For payment endpoints, enforce idempotency behavior during refactor:

- Validate idempotency key usage.
- Reuse previously stored successful result for repeated key.
- Block same-key requests with payload mismatch.
- Ensure transactional safety and unique-key guarantees.

## Dependency Approval Gate

Before adding new infrastructure, databases, caching layers, queues, or third-party platform dependencies during refactor, always ask for explicit approval first.

Examples that require approval:

- Redis.
- Queue/broker technologies.
- New data stores or search systems.
- New auth/security providers.
- New observability stacks.

Required prompt format:

"I can keep current architecture, or introduce [X] to improve [metric]. Do you want me to add [X]?"

If user says "yes": implement with migration/setup notes.
If user says "no": refactor only within existing stack.
If unclear: ask one concise clarification before coding.

### 1) Stability Baseline

1. Capture existing endpoint behavior and error semantics.
2. Identify critical paths by latency, error rate, and business value.
3. Preserve external contract unless contract changes are explicitly requested.

### 2) Architectural Cleanup

1. Separate transport, business, and persistence layers.
2. Remove duplicated logic and centralize domain rules.
3. Replace implicit side effects with explicit workflows.

### 3) Data and Query Optimization

1. Audit hot queries and add/adjust indexes.
2. Reduce over-fetching and repeated DB round-trips.
3. Introduce cursor pagination for large collections.
4. Tighten transaction boundaries and concurrency safety.

### 4) Reliability and Security Hardening

1. Standardize exception mapping and API error envelopes.
2. Add request validation and authorization checks where missing.
3. Add timeouts, retry policies, and circuit-breaker style guardrails where suitable.
4. Ensure logs are structured and privacy-safe.

### 5) Refactor Acceptance Criteria

Refactor is complete when:

- External behavior is preserved or intentionally versioned.
- P95/P99 latency improves or regression risk is documented.
- Structured logs include request_id, user_id, endpoint, latency, and error_code.
- P95 latency and error rate metrics are present.
- Tracing is added where applicable.
- Error handling is consistent across endpoints.
- N+1 query risks are eliminated via joins/batching/dataloader where needed.
- Payment APIs are idempotent and replay-safe.
- Security gaps are reduced (validation/auth/rate limits).
- Test coverage exists for critical and edge paths.

## Decision Points

- If full rewrite is risky: apply strangler-style incremental refactor.
- If performance gain conflicts with readability: prefer readable solution unless benchmark justifies complexity.
- If schema change is required: include safe migration and rollback strategy.

## Output Contract

1. Risk-ranked refactor plan with rollout strategy.
2. Incremental code changes with clear boundary improvements.
3. Query/index changes with rationale.
4. Verification strategy (tests + load/perf checks).
5. Post-refactor backlog for further hardening.

## Principles

- Optimize for correctness and operability first.
- Keep API contracts stable and explicit.
- Measure before and after for any performance claim.
- Make systems easier to reason about under incident pressure.
