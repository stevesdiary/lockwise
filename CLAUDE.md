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
    ├── upload/        # file uploads, bulk CSV/Excel upload (estates, residents, addresses, streets+units)
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
- Naming: `YYYYMMDDHHMMSS-<action>-<entity>.js`; active baseline uses `20260319XXXXXX` timestamps (65 migrations, 001–065); post-baseline additions: 066–079 spanning `20260425XXXXXX`–`20260524XXXXXX`
- No `{ ifNotExists: true }` guards in main branch migrations
- Deferred FK pattern for circular deps (e.g., `estates.created_by → users.id` added in migration 051)
- Security profile seed in migration 053 (`20260330000053`): inserts one `security` user per estate; email `security@<estate_code>.lockwise.local`; default password `Security@1234` (bcrypt, salt 10); uses `ON CONFLICT DO NOTHING`
- Grace period migration 054 (`20260403000054`): adds `grace_period_end_date` DATE nullable and `last_notification_sent` DATE nullable to `subscriptions`; adds `'grace_period'` to `enum_subscriptions_status` ENUM
- Plans seed in migration 055 (`20260403000055`): inserts Starter (free, 20 residents, basic category) and Standard (₦15,000/month, 200 residents, standard category); uses `ON CONFLICT (name) DO NOTHING`
- Migration 056 (`20260403000056`): makes `subscriptions.paid_on` DATE nullable (was NOT NULL)
- Migration 057 (`20260405000057`): adds `is_multi_entry` BOOLEAN default false, `max_entries` INTEGER nullable, `used_entries` INTEGER default 0 to `access_logs`
- FAQ seed in migration 058 (`20260405000058`): inserts 12 FAQs across 5 categories (access_codes/general/security/technical/payments); uses `randomUUID()`, queries for admin/manager user as `created_by`, skips existing questions
- Migration 059 (`20260405000059`): adds `consent_given` BOOLEAN NOT NULL default false and `consent_timestamp` DATE nullable to `users`
- Migration 060 (`20260417000060`): adds `access_direction` ENUM('entry','exit','both') NOT NULL default 'entry' to `access_logs`
- Migration 061 (`20260418000061`): adds `'streets_units'` to `enum_bulk_upload_jobs_upload_type` ENUM (uses `ADD VALUE IF NOT EXISTS`)
- Migration 062 (`20260418000062`): drops global unique index on `units.unit_identifier`; adds composite unique index `units_unit_identifier_street_id_unique` on (`unit_identifier`, `street_id`) — uniqueness is scoped per street, not globally
- Migration 063 (`20260422000063`): adds `logo_url` STRING nullable (default null) to `estates`; no `{ ifNotExists: true }` guard
- Migration 064 (`20260423000064`): converts `units.unit_type` from ENUM to VARCHAR so new types can be added without future migrations; default remains `'flat'`; drops `enum_units_unit_type`; `down` recreates the ENUM with values flat/duplex/chalet/terrace/plot/house/apartment/villa/other
- Migration 065 (`20260423000065`): adds `pending_update_data` JSONB nullable (default null) to `estates` — stores manager-submitted changes awaiting admin approval
- Migration 066 (`20260425000066`): adds `title` STRING(120) nullable (default null) to `community_messages`
- Migration 067 (`20260425000067`): creates 5 new tables — `emergency_contact_categories` (id UUID, name, icon, priority INTEGER default 100), `countries` (id UUID, name, iso_code CHAR(2) unique, phone_prefix), `states` (id UUID, country_id FK→countries CASCADE, name, code), `cities` (id UUID, state_id FK→states CASCADE, name), `location_emergency_contacts` (id UUID, category_id FK→categories CASCADE, name, phone_number, alt_phone_number, country_id FK, state_id FK nullable, city_id FK nullable, description, is_active BOOLEAN default true, priority; indexed on country_id/state_id/city_id and category_id)
- Migration 068 (`20260425000068`): seeds Nigeria (NG, +234), 4 states (Lagos LA, FCT FC, Rivers RI, Oyo OY), cities per state, 6 emergency contact categories (Police 10, Fire Service 20, Ambulance 30, Hospital 40, Rapid Response 50, Utility Emergency 60) with `location_emergency_contacts` entries at national/state scope; uses `ignoreDuplicates: true`
- Migration 079 (`20260524000079`): creates `maintenance_requests` (UUID PK, estate_id FK CASCADE, unit_id FK SET NULL nullable, submitted_by FK RESTRICT, title, description TEXT, category ENUM plumbing/electrical/structural/common_area/security/other, priority ENUM low/medium/high/urgent default 'medium', status ENUM open/in_progress/resolved/closed default 'open', photo_urls JSONB nullable, resolved_at DATE nullable, paranoid) and `maintenance_comments` (UUID PK, request_id FK CASCADE, author_id FK RESTRICT, message TEXT, is_status_change BOOLEAN default false, new_status STRING nullable); indexes on estate_id/submitted_by/status and request_id

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

**Estate code:** `estate_code` auto-generated in `estate.controller.ts` as `EST-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)()}-${customAlphabet('0123456789', 6)()}` (format: `EST-XXXXXXXX-NNNNNN`) — never supplied by the mobile client.

**Estate service — Sequelize plain objects:** `getEstateByCode` calls `.toJSON()` before returning, then spreads `id: plain.estate_id` into the response data. Always do this for any service that returns a single Sequelize instance to mobile — raw instances expose `estate_id` but not `id`, causing undefined reads on the client.

**Address controller** (`estate/controllers/address.controller.ts`):
- `getStreets`: injects `id: s.street_id` alias on each street so mobile reads either `street_id` or `id`
- `getUnits`: injects `id: plain.street.street_id` into the nested street object for the same reason
- `searchUnits` (new): GET `/address/estates/:estate_id/units/search`; required param `estateId`; optional query `search` (iLike on `unit_identifier` or `block`), optional `street_id`; returns units with nested street (attributes: `street_id`, `name` only)
- `createUnit`: coerces `floor` to `Number`; treats empty string as `undefined`; accepts `unit_details` JSONB field; `unit_type` is VARCHAR (converted from ENUM in migration 064); accepted values: `flat | duplex | chalet | terrace | plot | house | apartment | villa | other` (default `flat`)

**Estate route auth changes:**
- `GET /estate/one/:estateId`: `authenticateToken` only — `requireManager` guard removed; any authenticated user can fetch an estate by ID
- `PUT /estate/update/:estateId`: strips `status`, `approval_status`, `created_by`, `approved_by`, `estate_id` from request body; **manager** path calls `estateService.requestEstateUpdate` → stages changes in `pending_update_data` (also stores `_requested_by: userId` and `_requested_at: ISO timestamp` as metadata keys prefixed with `_`), returns 202; **admin** path calls `estateService.updateEstate` → applied immediately
- `GET /estate/estates/pending-updates` (`requireAdmin`): returns all estates where `pending_update_data IS NOT NULL`; used by `EstateUpdateRequestsScreen` on mobile
- `POST /estate/:estateId/apply-update` (`requireAdmin`): body `{ approved: boolean, rejection_reason? }`; calls `estateService.applyEstateUpdate` to commit or discard `pending_update_data`; on approval: merges non-`_`-prefixed keys from `pending_update_data` into estate, clears `pending_update_data`; on rejection: clears `pending_update_data` only
- `POST /estate/residents/bulk-invite`: resolves manager's `estate_id` from DB via `getManagerEstateId(userId)`, not from request body

**Access module** (`src/modules/access/`):
- `createAccessRecord` in `access.controller.ts`: access types `domestic_staff`, `service`, `maintenance` automatically set `is_multi_entry: true` and `max_entries: null` (unlimited); other types: passes client `is_multi_entry`; `max_entries` defaults to `1` if `is_multi_entry` is true and no client value provided (i.e. `max_entries || (is_multi_entry ? 1 : undefined)`); differs from `generateCode` which uses `null` for unlimited multi-entry
- `generateCode` in `access-code.controller.ts`: security role returns 403; `access_direction` defaults to `'entry'`; response includes `estateAddress`, `destinationAddress`, and `shareMessage`; share message formatted without maps URL (URL generated lazily via `/access-codes/:logId/share-url`)
- `validateCode` in `access-code.controller.ts`: queries `AccessLog.findOne({ where: { access_code: code, status: 'active' } })` — only active codes validate; also explicitly checks `valid_until` expiry (returns 400 if expired); returns `remaining_entries` (null for unlimited, integer for bounded multi-entry) in response `data`; 'exit'-only codes rejected at `scan_type: 'entry'` scan
- `approveAccess` in `access-code.controller.ts`: handles `access_direction: 'both'` — first scan sets `entry_time` (entry event); second scan (when `entry_time` already set) sets `exit_time` (exit event); `isExitScan` flag drives `entry_time` vs `exit_time` field and WebSocket event type
- `processCodeScan` in `access-log.service.ts`: valid statuses are `active`, `pending`, `approved`; both single-entry and multi-entry paths are wrapped in a DB transaction — single-entry creates the `access_entries` row then marks the log `'used'` atomically so a failure between the two steps leaves the code retryable; multi-entry increments `used_entries`, decrements on overflow, and marks `'used'` when `used_entries >= max_entries`; direction enforcement: `'exit'`-direction code throws when `scanType === 'entry'`

**Bulk upload** (`src/modules/upload/`):
- `POST /api/v1/bulk-upload/streets-units` — `requireManager`; `multipart/form-data` single file + `estateId` body param; parses CSV/Excel with `xlsx`; uses `Street.findOrCreate` + `Unit.findOrCreate` in a single transaction; `upload_type: 'streets_units'` in `bulk_upload_jobs`
- `GET /api/v1/bulk-upload/template/:type` — download CSV template for a given upload type

**Location emergency contacts** (`communication/`):
- Models (`models/location-emergency.model.ts`): `EmergencyContactCategory`, `Country`, `State`, `City`, `LocationEmergencyContact` — all sequelize-typescript decorator style
- Service (`services/location-emergency.service.ts`): `getContactsForLocation({ countryId, stateId?, cityId? })` — OR-queries national + state + city scoped contacts, groups by category, annotates scope badge (Local/State/National); `getCountries/getStates/getCities/getCategories` for hierarchical selectors; `createContact/updateContact/deleteContact/getAllContacts` for admin CRUD
- Routes (`routes/emergency.route.ts`): GET `/emergency/location-contacts` (authenticated); GET `/emergency/location-contacts/countries`, `/countries/:id/states`, `/states/:id/cities`, `/categories`; admin CRUD at `/emergency/location-contacts/admin[/:contactId]` (`requireAdmin`)
- `community_messages.title` STRING(120) nullable (added in migration 066); `sendAnnouncement` controller reads+saves optional `title`; `getMessages` includes `title` in response

**Chat routes** (`communication/routes/chat.route.ts`):
- All routes require `authenticateToken`
- `POST /chat/create` — creates a support chat session
- `POST /chat/send` — sends a message; `fileUploadService.chatUploader.array('attachments', 3)` + `validateFileUpload` middleware; max 3 file attachments
- `GET /chat/history/:chatId` — retrieves chat history; `validateChatAccess` middleware

**Email:** Uses Brevo (formerly Sendinblue) via `emailService`. Templates in `shared/templates/email.templates.ts`.

**Maintenance module** (`src/modules/maintenance/`):
- `maintenance.model.ts` — `MaintenanceRequest` + `MaintenanceComment` sequelize-typescript models; status lifecycle: `open → in_progress → resolved → closed`; each status change auto-creates a `MaintenanceComment` row with `is_status_change: true`
- `maintenance.service.ts` — access scoping: residents/security see own submissions; managers/admin see all in estate; master/super_admin cross-estate read
- Routes mounted at `/api/v1/maintenance`: `POST /maintenance` (submit); `GET /maintenance` (list); `GET /maintenance/:id` (detail + comments); `PATCH /maintenance/:id/status` (`requireManager`; auto-creates audit comment + notifies reporter); `POST /maintenance/:id/comments` (all authenticated); `POST /maintenance/photos` (multipart, up to 3 files field `photos`; returns `{ photo_urls: string[] }`); `DELETE /maintenance/:id` (`requireManager`, soft delete)
- Photo upload uses `fileUploadService` (same B2/AWS backend as headshot upload); mobile calls `POST /maintenance/photos` before final submit, embeds returned URLs in `photo_urls` payload field

**Observability** (`src/shared/observability/`):
- `metrics.ts` — `getMetrics(serviceName?)` singleton; returns `MetricsBundle` (prom-client `Registry` + Histograms/Counters/Gauge); metrics: `http_request_duration_seconds` (buckets 0.05–5s), `http_requests_total`, `db_query_duration_seconds` (buckets 0.01–10s), `db_query_errors_total`, `active_connections_total`; `resetMetricsForTest()` clears singleton for test isolation
- `http-metrics.middleware.ts` — `httpMetricsMiddleware`: records duration + total count per request with method/route/status_code labels
- `sequelize-hooks.ts` — `attachSequelizeObservability(sequelize)`: hooks `beforeQuery`/`afterQuery`/`queryError` on the Sequelize instance to record DB metrics
- `tracing.ts` — OpenTelemetry tracing; **side-effect module — import as first line of `src/shared/core/index.ts`** (before all other imports); NOT exported via barrel to enforce import order
- `index.ts` — barrel: exports `getMetrics`, `resetMetricsForTest`, `httpMetricsMiddleware`, `attachSequelizeObservability`

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
VTPASS_API_KEY / VTPASS_SECRET_KEY                                    # SMS primary (VTPass); service auto-enables when both are set
VTPASS_ENV                                                            # 'live' for production; omit or set to anything else for sandbox
KUDISMS_API_TOKEN                                                     # SMS fallback (KudiSMS); used when VTPass is not configured
KUDISMS_SENDER_ID                                                     # KudiSMS sender name (default: LOCKWISE)
KUDISMS_GATEWAY                                                       # KudiSMS gateway ID (default: 2)
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
