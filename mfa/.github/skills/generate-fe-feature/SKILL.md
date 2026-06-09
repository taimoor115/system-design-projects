---
name: generate-fe-feature
description: 'Generate production-ready frontend features as a senior principal engineer. Use when: creating new React/Next.js pages, admin features, forms, tables, dashboards, hooks, query integration, scalable UI architecture, accessibility-first UX, and performance-focused implementations for medium/high traffic apps.'
argument-hint: 'Describe feature, route/screen, API contracts, and UX constraints'
user-invocable: true
---

# Generate Frontend Feature

Create complete, production-grade frontend features with principal-level quality for performance, maintainability, and scale.

## Use When

- Building a new feature end-to-end in Next.js/React.
- Creating admin pages with data tables, search, filters, and pagination.
- Implementing forms with validation and API mutations.
- Designing feature-sliced frontend architecture that will scale.
- Hardening UX for reliability, loading states, and error recovery.

Trigger phrases:
- "generate FE feature"
- "build frontend feature"
- "create React feature"
- "make Next.js page with API integration"

## Inputs to Collect

1. Feature goal and user role.
2. Target route/screen and navigation entry point.
3. Data contract: request/response shape, pagination model, error model.
4. UX constraints: desktop/mobile behavior, empty/loading/error states.
5. Non-functional targets: expected traffic, latency budget, accessibility baseline.

## Dependency Approval Gate

Before adding any new tool, dependency, or infrastructure beyond current project patterns, always ask for explicit approval first.

Examples that require approval:

- Redis/cache layer.
- Message queues/background workers.
- New state management libraries.
- New UI libraries or form/query packages.
- New monitoring/analytics SDKs.

Required prompt format:

"I can implement this with [option A: current stack] or [option B: adds X]. Do you want me to add [X]?"

If user says "yes": implement and document the change.
If user says "no": continue with existing stack only.
If unclear: ask one concise follow-up question before coding.

If API details are missing, infer safe defaults and clearly mark assumptions.

## Workflow

## Mandatory Frontend Standards

Always enforce these defaults unless user explicitly overrides:

- Use React Hook Form for form state, including table-related filter/search/edit forms.
- Use Zod for validation schemas and request payload validation.
- Use loading skeletons for initial loading and key async UI regions.
- Disable submit actions during active mutation.
- Prevent double submit behavior and duplicate mutation triggers.
- Use optimistic updates only when conflict risk is low and rollback is well-defined.
- Target first-load JavaScript under 200KB per feature (ideal), and call out if exceeded.

### 1) Architecture First

1. Define feature boundary (components, hooks, types, API client, query keys).
2. Reuse existing design system and query key patterns before adding new abstractions.
3. Choose rendering/data strategy:
   - SSR + hydration for first-paint critical data.
   - Client queries for interactive and user-driven updates.

### 2) Data + State Strategy

1. Define stable query keys (all/list/detail pattern).
2. Implement paginated/cursor-aware queries with cache-aware transitions.
3. Implement mutations with targeted invalidation.
4. Normalize error handling and map API failures to user-friendly feedback.

### 3) UI Composition

1. Build composable, testable components with clear prop contracts.
2. Include skeletons, empty states, retry states, and optimistic UX when safe.
3. Ensure keyboard navigation, labels, focus states, and contrast compliance.
4. Keep visual consistency with existing app language and component primitives.

### 4) Performance Hardening

1. Prevent re-render churn (memoization only where measured/useful).
2. Avoid waterfall fetches and duplicate requests.
3. Use pagination/virtualization for large lists.
4. Prevent large-client bundle regressions via dynamic loading when appropriate.

### 5) Delivery Quality Gates

A feature is done only when all checks pass:

- Type-safe and lint-clean.
- No broken loading/error/empty UX path.
- Query invalidation/refetch behavior is correct.
- Submit controls are disabled during mutation and cannot double-fire.
- Optimistic updates are used only on safe operations with rollback handling.
- Works on mobile and desktop breakpoints.
- Accessibility baseline met for forms, tables, and dialogs.
- First-load JavaScript target is under 200KB per feature (or deviation is explicitly justified).
- Includes targeted tests for key behavior.

## Output Contract

When invoked, produce:

1. A concise implementation plan.
2. Full implementation (not pseudo-code), aligned to project conventions.
3. Explicit assumptions and trade-offs.
4. Quick verification checklist and test commands.
5. Optional follow-up improvements ranked by impact.

## Principles

- Prefer project conventions over generic patterns.
- Optimize for future maintainers: clear boundaries, predictable APIs, minimal surprise.
- Prioritize user clarity under failure, not just happy path.
- Design for scale from day one: pagination, cache strategy, and resilient UX.
