Project: architecture pointers, NOT full content
# lockwise-server

Express 5 / TypeScript 5.8 REST + WebSocket API for the Lockwise estate access management platform.

## Commands

```bash
npm run dev              # Start dev server (nodemon)
npm run build            # Compile TypeScript → dist/
npm start                # Run compiled output
NODE_ENV=test npx jest --config tests/setup/jest.config.ts --no-coverage   # Run all tests
NODE_ENV=test npx jest --config tests/setup/jest.config.ts --testPathPattern="<name>" --no-coverage  # Run specific test file
npx tsc --noEmit         # Type-check without emitting
npx sequelize-cli db:migrate --env development   # Run pending migrations
```

## Entry Points

- `src/shared/core/index.ts` — Express app bootstrap, middleware, server start
- `src/router.ts` — All route mounts
- `src/shared/core/database.ts` — Sequelize instance + Umzug migration runner (`runMigrations()`)

## Architecture

```
src/
├── shared/
│   ├── core/          # index.ts (app), database.ts (Sequelize + Umzug)
│   ├── middleware/    # All cross-cutting middleware; barrel: index.ts
│   ├── services/      # database.service.ts (thin dbService wrapper)
│   ├── schemas/       # Shared validation schemas
│   ├── templates/     # Email templates (email.templates.ts)
│   └── utils/         # param.util, validator, etc.
└── modules/
    ├── auth/          # users, roles, login, Google OAuth, phone/email verification, password reset
    ├── estate/        # estate CRUD, gates, onboarding wizard endpoints, invitation
    ├── access/        # access codes, NFC, access logs
    ├── payment/       # subscriptions, payments, plans, referrals, Paystack webhooks
    ├── amenities/     # amenities, reservations
    ├── parking/       # parking slots, EV charging
    ├── support/       # support tickets, messages
    ├── communication/ # notifications, chat, emergency alerts, email service
    ├── community/     # community posts, comments, messages
    ├── analytics/     # analytics events, dashboard, monitoring
    ├── upload/        # file uploads, bulk CSV upload
    ├── location/      # addresses
    ├── mobile/        # mobile-specific endpoints
    ├── admin/         # roles, permissions, API keys, config, user-roles
    └── legal/         # legal documents
```

Each module has: `models/`, `services/`, `controllers/`, `routes/`, and optionally `types/` + `tests/`.

## Test Environment

`.env.test` uses SQLite in-memory (`DB_DIALECT=sqlite`, `DB_STORAGE=:memory:`) with mock keys for all external services. Run all tests with:
```bash
NODE_ENV=test npx jest --config tests/setup/jest.config.ts --no-coverage
```

## Key Conventions

**Migrations** (`migrations/`):
- Naming: `YYYYMMDDHHMMSS-<action>-<entity>.js`; active baseline uses `20260319XXXXXX` timestamps (55 migrations, 001–055)
- No `{ ifNotExists: true }` guards in main branch migrations (only in `.worktrees/modularize/`)
- Deferred FK pattern for circular deps (e.g., `estates.created_by → users.id` added in migration 051)
- Security profile seed in migration 053 (`20260330000053`): inserts one `security` user per estate; email `security@<estate_code>.lockwise.local`; default password `Security@1234` (bcrypt, salt 10); uses `ON CONFLICT DO NOTHING`
- Grace period migration 054 (`20260403000054`): adds `grace_period_end_date` DATE nullable and `last_notification_sent` DATE nullable to `subscriptions`; adds `'grace_period'` to `enum_subscriptions_status` ENUM
- Plans seed in migration 055 (`20260403000055`): inserts Starter (free, 20 residents, basic category) and Standard (₦15,000/month, 200 residents, standard category); uses `ON CONFLICT (name) DO NOTHING`

**Middleware** (`shared/middleware/`):
- `authenticateToken` — verifies JWT, attaches `req.user`
- `requireAdmin` — MASTER/SUPER_ADMIN/ADMIN only
- `requireManager` — MASTER/SUPER_ADMIN/ADMIN/MANAGER (includes admin)
- `verifyUser` — checks `users.status === 'active'`

**Role extraction in controllers:**
- `req.user.role` is a plain string, NOT an object. Use: `(req.user!.role as string)?.toLowerCase()`
- Never use `.role?.name` — that will always be undefined

**Ownership check pattern** (for manager-owned resources):
```typescript
const userRole = (req.user!.role as string)?.toLowerCase() || '';
const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
if (!isAdmin) {
  const existing = await service.getOne(id);
  if (!existing?.data || existing.data.created_by !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
}
```

**Payment (Paystack):**
- Webhook at `POST /api/v1/webhooks/paystack` — HMAC-SHA512 via `x-paystack-signature`; exempt from CSRF
- `charge.success` processed atomically in SERIALIZABLE transaction; subscription receipt email sent **after** transaction commits (fire-and-forget `.catch()`); subscription status lifecycle: `inactive` → `active` → `grace_period` → `cancelled` / `expired`
- Reference format: `LW_${nanoid(10)}_${Date.now()}`
- Payment client: `paystack.service.ts` (no Flutterwave service)

**Estate status flow:** `draft → pending → approved / declined → pending (resubmit)`

**Estate code:** `estate_code` auto-generated in `estate.controller.ts` as `EST-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)()}` — never supplied by the mobile client.

**Email:** Uses Brevo (formerly Sendinblue) via `emailService`. Templates in `shared/templates/email.templates.ts`.

## Required Env Vars (key ones)

```
DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD/DB_DIALECT
JWT_SECRET / REFRESH_TOKEN_SECRET
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY   # push notifications
PAYSTACK_SECRET_KEY                                                    # payments
BREVO_API_KEY                                                         # email
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER         # SMS
```
