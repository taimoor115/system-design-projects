# API Conventions

Stack: NestJS 11 · Drizzle ORM · PostgreSQL · Redis · BullMQ · nestjs-zod · JWT + Google OAuth

## Module Structure

```
src/
  auth/             — JWT + Google OAuth, guards, decorators, rate limiting
  books/            — Core domain
  characters/
  jobs/             — Background job tracking
  queues/           — BullMQ definitions + processors (QUEUE_IMAGE = primary async queue)
  infrastructure/
    database/       — Drizzle + PostgreSQL
    redis/          — Shared Redis client (NOT the BullMQ connection)
    storage/        — AWS S3
    gemini/ google-tts/ elevenlabs/ health/
  common/           — Global filters, interceptors, utilities
  repositories/     — Base patterns; each domain has *.repository.interface.ts + *.repository.ts
```

## Patterns

- **Repository:** `*.repository.interface.ts` defines the token. `*.repository.ts` is the implementation. Module providers register both. Inject the interface — never the class.
- **DTOs:** Extend `createZodDto(schema)` from `nestjs-zod`. Schema must come from `@repo/schemas`.
- **Errors:** Throw NestJS exceptions (`NotFoundException`, `BadRequestException`, etc.). The global filter handles the HTTP response. No try/catch in controllers.
- **Redis:** All Redis operations go through `infrastructure/redis/`. No direct `ioredis` calls elsewhere.
- **Env:** `.env.local` → `.env`, resolved from repo root then `apps/api/`.

## Anti-Patterns

- Do not register `@Injectable()` repository without its interface token in module providers
- Do not call processor functions directly — dispatch via queue only
- Do not put any Zod schema in `apps/api/` — belongs in `packages/schemas/`
- Do not add logic to controllers beyond input validation and delegation
