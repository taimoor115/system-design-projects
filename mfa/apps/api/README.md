# MFA Demo API

NestJS backend implementing TOTP-based two-factor authentication with MongoDB via Prisma.

## Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_MFA_PENDING_SECRET` | Separate secret for MFA pending tokens |
| `ENCRYPTION_KEY` | 64-char hex string (32 bytes) for AES-256-GCM |
| `APP_NAME` | App name shown in authenticator app |
| `PORT` | Server port (default: 3001) |

Generate an `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## MFA Flow

### Setup Flow

1. `POST /api/v1/auth/register` → create account
2. `POST /api/v1/auth/login` → get `accessToken` (no MFA yet)
3. `POST /api/v1/mfa/setup` → get QR code + `base32Secret`
4. Scan QR code with Google Authenticator
5. `POST /api/v1/mfa/confirm { code: "123456" }` → get `recoveryCodes[]`
6. Save recovery codes somewhere safe

### Login Flow (MFA Active)

1. `POST /api/v1/auth/login { email, password }`
   → Response: `{ requiresMfa: true, mfaToken: "..." }`
2. `POST /api/v1/auth/mfa/validate { code: "123456" }`
   → `Authorization: Bearer {mfaToken}`
   → Response: `{ accessToken: "..." }`

### Recovery Code Flow

1. `POST /api/v1/auth/login` → get `mfaToken`
2. `POST /api/v1/auth/mfa/validate { code: "a3f9b2c1d4" }` (10-char hex recovery code)
   → Response: `{ accessToken: "..." }`
   → That recovery code is now permanently invalidated

## API Endpoints

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | None | Create account |
| POST | `/api/v1/auth/login` | None | Login |
| GET | `/api/v1/auth/me` | Bearer access | Get current user status |
| POST | `/api/v1/auth/mfa/validate` | Bearer mfaToken | Validate MFA code |

### MFA (requires Bearer access token)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/mfa/setup` | Generate secret + QR code |
| POST | `/api/v1/mfa/confirm` | Confirm setup + get recovery codes |
| POST | `/api/v1/mfa/disable` | Disable MFA |

## Security Design

- TOTP secrets are AES-256-GCM encrypted in MongoDB — never stored in plaintext
- Recovery codes are bcrypt-hashed (saltRounds: 12) — shown exactly once
- Full `accessToken` is never issued when MFA is enabled — only after code verification
- The `mfaToken` uses a different secret (`JWT_MFA_PENDING_SECRET`) and expires in 3 minutes
- Replay attack prevention via `lastUsedTotpStep` tracking
- Rate limiting: 5 attempts per minute on `/auth/mfa/validate`, 10/min on `/mfa/setup`
