# Web Conventions

Stack: Next.js 16 (App Router · Turbopack) · React 19 · TailwindCSS 4 · shadcn/ui · TanStack Query v5 · React Hook Form + Zod · Axios

## Directory Structure

```
src/
  features/     — Feature-sliced modules (books/ editions/ pages/ transcription/ variants/ admin/ user-management/)
                  Each: components/ hooks/ types/
  components/   — Shared UI
  context/      — React context providers
  lib/          — Axios client, query-keys.ts, utilities
```

## Query Key Factory

All keys live in `lib/react-query/query-keys.ts`. Always follow this shape:

```ts
domain.all()            // invalidates entire domain
domain.list(params?)    // invalidates all list pages
domain.detail(id)       // single item
```

## SSR Prefetch

Server component → `queryClient.setQueryData(key, data)` → `dehydrate(queryClient)` → pass to `<QueryProvider>`.
Client `useQuery` with `staleTime` finds data fresh and skips network call.

## Mutations

Always call `invalidateQueries` on `onSuccess`:

- Collection change → `invalidateQueries({ queryKey: domain.list() })`
- Single item change → `invalidateQueries({ queryKey: domain.detail(id) })`
- Both affected → `invalidateQueries({ queryKey: domain.all() })`

## Forms

Use React Hook Form + Zod resolver. Schema from `@repo/schemas`. No inline validation.

## Error Boundaries

Wrap async feature containers in `components/error-boundary.tsx`. Not just the root layout.

## Anti-Patterns

- Do not set `staleTime: 0` on paginated queries — breaks `keepPreviousData`
- Do not use endpoint strings as query keys
- Do not fetch with `useEffect` + `fetch` in client components — use `useQuery`
- Do not define Zod schemas in feature files — use `@repo/schemas`
- Do not import server-only modules into client components
