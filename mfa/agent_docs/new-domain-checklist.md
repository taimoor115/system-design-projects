# New Domain Checklist

Use this when adding a new feature domain end-to-end.

## API

- [ ] Create `*.repository.interface.ts` with interface token
- [ ] Create `*.repository.ts` implementing the interface
- [ ] Register interface token + implementation in module providers
- [ ] Add Zod schema to `packages/schemas/` — not inside `apps/api/`
- [ ] Create DTO extending `createZodDto(schema)`
- [ ] Add service — business logic only, no HTTP concerns
- [ ] Add controller — input validation + delegation only
- [ ] If async work: add job to `QUEUE_IMAGE` or relevant queue, never inline

## Web

- [ ] Add key factory to `lib/react-query/query-keys.ts` (`all / list / detail`)
- [ ] `features/<domain>/hooks/queries.ts` — one `useQuery` per read endpoint
- [ ] `features/<domain>/hooks/mutations.ts` — one `useMutation` per write, invalidate on success
- [ ] SSR prefetch: `setQueryData` in server component before `dehydrate()`
- [ ] Wrap feature container in `<ErrorBoundary>`
- [ ] Form schema lives in `@repo/schemas`, resolved via React Hook Form
