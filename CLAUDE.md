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
    ├── communication/ # notifications, chat, emergency alerts, email service, web push
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
- Naming: `YYYYMMDDHHMMSS-<action>-<entity>.js`; active baseline uses `20260319XXXXXX` timestamps (59 migrations, 001–059)
- No `{ ifNotExists: true }` guards in main branch migrations
- Deferred FK pattern for circular deps (e.g., `estates.created_by → users.id` added in migration 051)
- Security profile seed in migration 053 (`20260330000053`): inserts one `security` user per estate; email `security@<estate_code>.lockwise.local`; default password `Security@1234` (bcrypt, salt 10); uses `ON CONFLICT DO NOTHING`
- Grace period migration 054 (`20260403000054`): adds `grace_period_end_date` DATE nullable and `last_notification_sent` DATE nullable to `subscriptions`; adds `'grace_period'` to `enum_subscriptions_status` ENUM
- Plans seed in migration 055 (`20260403000055`): inserts Starter (free, 20 residents, basic category) and Standard (₦15,000/month, 200 residents, standard category); uses `ON CONFLICT (name) DO NOTHING`
- Migration 056 (`20260403000056`): makes `subscriptions.paid_on` DATE nullable (was NOT NULL)
- Migration 057 (`20260405000057`): adds `is_multi_entry` BOOLEAN default false, `max_entries` INTEGER nullable, `used_entries` INTEGER default 0 to `access_logs`
- FAQ seed in migration 058 (`20260405000058`): inserts 12 FAQs across 5 categories (access_codes/general/security/technical/payments); uses `randomUUID()`, queries for admin/manager user as `created_by`, skips existing questions
- Migration 059 (`20260405000059`): adds `consent_given` BOOLEAN NOT NULL default false and `consent_timestamp` DATE nullable to `users`

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

**Web Push** (`communication/services/web-push.service.ts`, routes at `/push`):
- VAPID-based browser push via `web-push` package; subscriptions stored in Redis key `push_sub:<userId>` with 90-day TTL
- `GET /push/vapid-public-key` — no auth; returns public key for service worker registration
- `POST /push/subscribe` — `authenticateToken` required; saves `PushSubscription` object from request body
- `DELETE /push/unsubscribe` — `authenticateToken` required; removes subscription from Redis
- `webPushService.sendToUser(userId, payload)` — reads Redis, sends push; auto-deletes subscription on 410 Gone
- `webPushService.sendToUsers(userIds[], payload)` — broadcasts via `Promise.allSettled`
- `notificationService.queueWebPush(userIds, payload)` — enqueues via QStash to `POST /workers/web-push` (retries: 3)
- QStash worker: `POST /workers/web-push`; body: `{ userIds: string[], title, body, url?, tag? }`; same QStash signature verification as email/SMS workers
- Called automatically: estate submission notifies all admins; bulk upload completion sends summary push to admin

## Required Env Vars (key ones)

```
DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD/DB_DIALECT
JWT_SECRET / REFRESH_TOKEN_SECRET
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY   # push notifications
PAYSTACK_SECRET_KEY                                                    # payments
REFERRAL_BONUS_PERCENTAGE                                             # referral bonus % (e.g. 10)
BIANNUAL_DISCOUNT_PERCENT / ANNUAL_DISCOUNT_PERCENT                   # subscription billing discounts (e.g. 5 / 15)
BREVO_API_KEY                                                         # email
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER         # SMS
VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT                 # web push (VAPID_SUBJECT defaults to mailto:admin@lockwise.app)
QSTASH_TOKEN / QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY # async job queue (QStash)
WORKER_BASE_URL                                                       # base URL for QStash worker callbacks (default: http://localhost:3002/api/v1)
WORKER_SECRET                                                         # local dev bypass secret (used instead of QStash signature when NODE_ENV != production)
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN                    # Redis (Upstash) for web push subscriptions and session data
STORAGE_PROVIDER                                                      # file storage backend: 'b2' (default) or 'aws'
B2_APPLICATION_KEY_ID / B2_APPLICATION_KEY / B2_BUCKET_NAME / B2_BUCKET_ID  # Backblaze B2 (when STORAGE_PROVIDER=b2)
GOOGLE_MAPS_API_KEY                                                   # maps / location features
MAX_SESSIONS_RESIDENT / MAX_SESSIONS_MANAGER / MAX_SESSIONS_ADMIN / MAX_SESSIONS_SECURITY / MAX_SESSIONS_SUPER_ADMIN  # concurrent login session limits per role
```
