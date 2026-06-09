---
name: refactor-fe-code
description: 'Refactor frontend code as a senior principal engineer. Use when: improving React/Next.js feature structure, reducing complexity, fixing state/query anti-patterns, improving performance and accessibility, enforcing scalability standards, and upgrading code quality without changing product behavior.'
argument-hint: 'Paste current code or identify feature/module and refactor goals'
user-invocable: true
---

# Refactor Frontend Code

Refactor frontend code for scalability, readability, and reliable behavior under growing traffic while preserving existing product behavior.

## Use When

- A component/module is hard to maintain or too coupled.
- Query/state logic is duplicated or inconsistent.
- Performance issues appear in lists, dashboards, or complex forms.
- You need principal-level clean architecture without full rewrites.

Trigger phrases:
- "refactor FE code"
- "clean up React code"
- "make this frontend scalable"
- "improve Next.js architecture"

## Refactor Strategy

## Mandatory Frontend Standards

Always enforce these defaults during refactor unless user explicitly overrides:

- Use React Hook Form for form flows, including table-related filter/search/edit forms.
- Use Zod for schema validation and payload validation boundaries.
- Use loading skeletons for initial and async loading states.
- Disable submit actions while mutation is in flight.
- Prevent duplicate submits and bad UX caused by rapid repeated actions.
- Use optimistic updates only when data consistency risk is low and rollback exists.
- Keep first-load JavaScript under 200KB per feature (ideal), or document why not.

## Dependency Approval Gate

Before introducing any new dependency, infrastructure, or platform component during refactor, always ask for explicit approval first.

Examples that require approval:

- Redis/cache layer.
- Queue/event systems.
- New client libraries for state, forms, data-fetching, or UI.
- New observability SDKs.

Required prompt format:

"Current refactor can be done with existing stack, or improved with [X]. Do you want me to add [X]?"

If user says "yes": apply and document changes.
If user says "no": refactor with existing dependencies only.
If unclear: ask one concise clarification.

### 1) Baseline and Behavior Lock

1. Identify current behavior and non-negotiable outputs.
2. Capture risky paths: loading/error/empty/form-submit states.
3. Define constraints: no user-visible regressions unless requested.

### 2) Structural Decomposition

1. Split large files into feature-level boundaries:
   - Presentational components.
   - Data hooks and query orchestration.
   - Domain types/transformers.
2. Remove prop drilling and hidden state coupling.
3. Replace ad-hoc fetch logic with consistent query/mutation hooks.

### 3) State and Data Refactor

1. Standardize query keys and invalidation strategy.
2. Eliminate duplicated API calls and race-prone effects.
3. Consolidate form schema validation and API payload mapping.

### 4) Performance and UX Reliability

1. Remove unnecessary re-renders and unstable callback props.
2. Improve large-list behavior with pagination/virtualization.
3. Ensure robust loading, retry, and fallback UX paths.
4. Improve accessibility semantics and keyboard interactions.

### 5) Quality Controls

Refactor is accepted only when:

- Behavior parity is maintained for required flows.
- Complexity is reduced (smaller units, clearer interfaces).
- Types are stronger and unsafe casts reduced.
- Performance hotspots are addressed or documented.
- Submit behavior is protected from duplicate actions and unsafe optimistic states.
- First-load JavaScript budget target is checked (<200KB ideal per feature).
- Tests are added/updated for refactored boundaries.

## Decision Points

- If behavior is unclear: preserve existing output and mark assumptions.
- If multiple structures are viable: choose the option with lower cognitive load and easier testing.
- If optimization adds complexity: keep simpler implementation unless measurable bottleneck exists.

## Output Contract

1. Refactor plan with risk levels.
2. Incremental code changes that are production-safe.
3. Before/after rationale by module responsibility.
4. Validation checklist for behavior parity and performance.
5. Follow-up backlog: high/medium/low improvements.

## Principles

- Refactor for maintainability first, micro-optimization second.
- Keep interfaces stable; improve internals aggressively.
- Favor explicit data flow over implicit side effects.
- Make failure modes obvious and recoverable.
