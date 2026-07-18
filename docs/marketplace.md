# Marketplace Module — Execution Plan

## Overview

A community-scoped marketplace where verified residents can list physical goods or services for sale/hire within their estate. Buyers contact sellers via in-app chat. No payment processing through Lockwise — transactions happen between residents directly (cash, transfer, POS).

---

## Phase 1: Data Layer

### Migration: `20260506000074-create-marketplace-tables.js`

**Table: `marketplace_listings`**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | seller |
| estate_id | UUID FK → estates | scopes visibility |
| type | ENUM('product', 'service') | |
| title | VARCHAR(200) | |
| description | TEXT | |
| price | DECIMAL(12,2) | 0 = free / negotiable |
| currency | VARCHAR(3) | default 'NGN' |
| is_negotiable | BOOLEAN | default false |
| category | ENUM (see below) | |
| images | JSONB | array of upload URLs, max 5 |
| condition | ENUM('new','fairly_used','refurbished') | null for services |
| availability | ENUM('available','sold','reserved','expired') | default 'available' |
| location_hint | VARCHAR(200) | e.g. "Block C" — no exact address |
| views_count | INTEGER | default 0 |
| expires_at | DATE | auto-expire after 30 days |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Indexes: `estate_id + availability + category` (composite), `user_id`, `expires_at`

**Table: `marketplace_inquiries`**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| listing_id | UUID FK → marketplace_listings | |
| buyer_id | UUID FK → users | |
| seller_id | UUID FK → users | denormalized for query speed |
| message | TEXT | initial inquiry message |
| status | ENUM('open','replied','closed') | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Index: `buyer_id`, `seller_id`, `listing_id`

**Table: `marketplace_saved`** (wishlist/bookmarks)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| listing_id | UUID FK → marketplace_listings | |
| created_at | TIMESTAMP | |

Unique index: `user_id + listing_id`

**Categories ENUM:**

`electronics`, `furniture`, `clothing`, `vehicles`, `food`, `beauty`, `home_appliances`, `books`, `sports`, `cleaning`, `repairs`, `tutoring`, `errands`, `other`

---

## Phase 2: Module Structure

```
src/modules/marketplace/
├── models/
│   ├── listing.model.ts
│   ├── inquiry.model.ts
│   └── saved.model.ts
├── services/
│   └── marketplace.service.ts
├── controllers/
│   └── marketplace.controller.ts
├── routes/
│   └── marketplace.route.ts
└── types/
    └── marketplace.types.ts
```

---

## Phase 3: API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/marketplace/listings` | Create listing | ✓ |
| GET | `/marketplace/listings` | Browse estate listings (paginated, filterable) | ✓ |
| GET | `/marketplace/listings/:id` | View listing detail (increments views) | ✓ |
| PATCH | `/marketplace/listings/:id` | Edit own listing | ✓ |
| PATCH | `/marketplace/listings/:id/status` | Mark sold/reserved/available | ✓ |
| DELETE | `/marketplace/listings/:id` | Remove own listing | ✓ |
| GET | `/marketplace/my-listings` | Seller's own listings | ✓ |
| POST | `/marketplace/listings/:id/inquire` | Send inquiry to seller | ✓ |
| GET | `/marketplace/inquiries` | Get my inquiries (sent + received) | ✓ |
| POST | `/marketplace/listings/:id/save` | Bookmark a listing | ✓ |
| DELETE | `/marketplace/listings/:id/save` | Remove bookmark | ✓ |
| GET | `/marketplace/saved` | Get saved listings | ✓ |

**Query filters for browse:**

`?category=electronics&type=product&minPrice=500&maxPrice=50000&search=iphone&sort=newest|price_asc|price_desc`

---

## Phase 4: Business Rules

1. **Estate-scoped** — residents only see listings from their own estate
2. **Verified residents only** — user must have `status: 'active'` and belong to an estate
3. **Max 10 active listings per user** — prevents spam
4. **Auto-expire after 30 days** — cron job marks expired listings (fits existing cron pattern)
5. **No self-inquiry** — seller cannot inquire on their own listing
6. **Image upload** — reuse existing upload module (`/api/v1/upload`), store URLs in JSONB
7. **Soft moderation** — estate managers can flag/remove inappropriate listings (future phase)

---

## Phase 5: Notifications

When an inquiry is created → queue notification to seller:

- **Email**: "Someone is interested in your listing: {title}"
- **Push** (if mobile): via existing `NotificationService.sendNotification`

Template: `marketplaceInquiry` added to `email.templates.ts`

---

## Phase 6: Expiry Cron Job

Add to existing cron pattern:

- Runs daily
- Sets `availability = 'expired'` where `expires_at < NOW()` and `availability = 'available'`
- No queue needed (simple scheduled maintenance — per existing cron rules)

---

## Phase 7: Wire Up

1. Register route in `router.ts`: `router.use('/marketplace', marketplaceRouter)`
2. Register models in `database.ts`
3. Run migration

---

## Phase 8: Mobile (React Native)

Screens to add in `lockwise-mobile`:

- **MarketplaceFeedScreen** — grid/list of listings with category tabs + search
- **ListingDetailScreen** — images carousel, description, price, "Contact Seller" button
- **CreateListingScreen** — form with image picker (reuse `expo-image-picker`)
- **MyListingsScreen** — manage own listings
- **SavedListingsScreen** — bookmarked items

---

## Execution Order

| Step | Task | Depends on |
|------|------|-----------|
| 1 | Types + migration | — |
| 2 | Models | Step 1 |
| 3 | Service (CRUD + filters + expiry) | Step 2 |
| 4 | Controller + routes | Step 3 |
| 5 | Email template + notification on inquiry | Step 4 |
| 6 | Wire into router + database.ts | Step 4 |
| 7 | Expiry cron job | Step 3 |
| 8 | Tests | Step 4 |
| 9 | Mobile screens | Step 6 |

---

## Out of Scope (Future Phases)

- In-app payment/escrow between residents
- Ratings/reviews for sellers
- Promoted/featured listings
- Cross-estate marketplace
- Admin moderation dashboard
