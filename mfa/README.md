# MFA Demo — Two-Factor Authentication

A full-stack demo application implementing secure Two-Factor Authentication (2FA) using Time-based One-Time Passwords (TOTP) with QR codes, authenticator apps, and recovery codes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | NestJS 11, Prisma 5, MongoDB |
| Auth | Passport.js, JWT (dual-token strategy) |
| 2FA | otplib (TOTP), qrcode |
| Encryption | AES-256-GCM |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| HTTP Client | Axios |
| Validation | Zod + nestjs-zod |
| Monorepo | pnpm workspaces + Turborepo |

## Project Structure

```
mfa/
├── apps/
│   ├── api/          # NestJS backend (port 7272)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   ├── schemas/      # Shared Zod schemas
│   ├── eslint-config/
│   └── typescript-config/
└── docker-compose.yaml
```

## Prerequisites

- Node.js >= 18
- pnpm 9+
- Docker (for MongoDB)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start MongoDB with Replica Set

Prisma requires MongoDB to run as a replica set.

```bash
# Start container
docker run -d --name mongodb_mfa \
  -p 27017:27017 \
  -v mongodb_mfa_data:/data/db \
  mongo:7 mongod --replSet rs0 --bind_ip_all

# Wait a few seconds, then initiate the replica set
docker exec mongodb_mfa mongosh --eval \
  "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
```

### 3. Configure Environment Variables

**API** — create `apps/api/.env`:

```env
DATABASE_URL="mongodb://localhost:27017/mfa-demo"
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_MFA_PENDING_SECRET="different-secret-min-32-chars"
ENCRYPTION_KEY="64-character-hex-string"
APP_NAME="MFADemo"
PORT=7272
SWAGGER_PASSWORD=admin
```

Generate a valid `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:7272"
```

### 4. Run the App

```bash
# Run both API and web together
pnpm dev

# Or run individually
pnpm --filter api dev
pnpm --filter web dev
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:7272>
- Swagger Docs: <http://localhost:7272/api-docs> (user: `admin`, password from `.env`)

## API Endpoints

Base path: `/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login — returns `accessToken` or `mfaToken` |
| GET | `/auth/me` | JWT | Get current user |
| POST | `/auth/mfa/validate` | MFA-pending JWT | Submit TOTP code, receive full access token |

### MFA Management

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/mfa/setup` | JWT | Generate TOTP secret + QR code |
| POST | `/mfa/confirm` | JWT | Confirm setup with first code, get recovery codes |
| POST | `/mfa/disable` | JWT | Disable 2FA |

### Infrastructure

| Endpoint | Description |
| --- | --- |
| `/api-docs` | Swagger UI (basic auth) |
| `/health/live` | Liveness probe |
| `/health/ready` | Readiness probe |
| `/metrics` | Prometheus metrics |

## How 2FA Works

```
Setup flow:
  POST /mfa/setup    → returns QR code + base32 secret
  User scans QR in authenticator app
  POST /mfa/confirm  → validates first code → activates 2FA + returns recovery codes

Login flow:
  POST /auth/login          → password OK + 2FA enabled → returns short-lived mfaToken (3 min)
  POST /auth/mfa/validate   → TOTP code OK → returns full accessToken (7 days)
```

Recovery codes (8 codes) are generated on setup, hashed with bcrypt, and each can only be used once.

## Database Schema

```
User
  id                     ObjectId
  email                  String (unique)
  password               String (bcrypt)
  twoFactorEnabled       Boolean
  twoFactorSecret        String? (AES-256-GCM encrypted)
  pendingTwoFactorSecret String? (cleared after confirm)
  lastUsedTotpStep       Int? (replay attack prevention)

RecoveryCode
  id        ObjectId
  userId    ObjectId → User
  codeHash  String (bcrypt)
  isUsed    Boolean
```

## Useful Commands

```bash
# Database
pnpm --filter api studio        # Open Prisma Studio
pnpm --filter api migrate:dev   # Run migrations

# Build
pnpm build                      # Build all
pnpm check-types                # Type check all

# Lint & Format
pnpm lint
pnpm format
```
