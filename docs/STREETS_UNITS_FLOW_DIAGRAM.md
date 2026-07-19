# Streets & Units Bulk Upload Flow Diagram

## Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                          │
│                                                                 │
│  1. User selects CSV/Excel file                                │
│  2. User enters estate code (e.g., "SG001")                    │
│  3. Submit upload request                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API ENDPOINT                                  │
│   POST /api/v1/bulk-upload/streets-units                       │
│                                                                 │
│   Body: { file: <file>, estateCode: "SG001" }                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION                                │
│                                                                 │
│   ✓ Verify JWT token                                          │
│   ✓ Check user role (Manager/Admin)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FILE VALIDATION                               │
│                                                                 │
│   ✓ Check file format (.xlsx, .xls, .csv)                     │
│   ✓ Validate file size (< 10MB)                               │
│   ✓ Scan for malicious content                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERMISSION CHECK                              │
│                                                                 │
│   IF Manager:                                                   │
│     ✓ Lookup user's estate                                     │
│     ✓ Verify estate_code matches request                       │
│     ✗ Reject if mismatch                                       │
│                                                                 │
│   IF Admin/Super Admin:                                         │
│     ✓ Allow any estate                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              START DATABASE TRANSACTION                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ESTATE LOOKUP                                 │
│                                                                 │
│   Query: SELECT * FROM estates                                  │
│          WHERE estate_code = 'SG001'                           │
│                                                                 │
│   ✓ Estate found → Continue                                    │
│   ✗ Estate not found → Rollback & Error                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FILE PARSING                                  │
│                                                                 │
│   1. Read file buffer                                          │
│   2. Parse with XLSX.js                                        │
│   3. Convert to JSON array                                     │
│   4. Extract rows                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ROW PROCESSING LOOP                           │
│                                                                 │
│   FOR EACH ROW:                                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 1. Extract Data                                 │         │
│   │    - street_name                                │         │
│   │    - unit_identifier                            │         │
│   │    - unit_type (default: 'flat')               │         │
│   │    - block (optional)                           │         │
│   │    - floor (optional)                           │         │
│   └─────────────────┬───────────────────────────────┘         │
│                     │                                           │
│                     ▼                                           │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 2. Validate Required Fields                     │         │
│   │    ✓ street_name present?                       │         │
│   │    ✓ unit_identifier present?                   │         │
│   │    ✗ Missing → Add to errors, skip row         │         │
│   └─────────────────┬───────────────────────────────┘         │
│                     │                                           │
│                     ▼                                           │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 3. Find or Create Street                        │         │
│   │    Query: WHERE name = street_name              │         │
│   │           AND estate_id = estate.id             │         │
│   │    ✓ Exists → Use existing                      │         │
│   │    ✗ Not exists → Create new                    │         │
│   │    Increment streetsCreated if new              │         │
│   └─────────────────┬───────────────────────────────┘         │
│                     │                                           │
│                     ▼                                           │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 4. Validate Unit Type                           │         │
│   │    Valid types: flat, duplex, chalet,           │         │
│   │                 terrace, plot, house,           │         │
│   │                 apartment, other                │         │
│   │    Invalid → Default to 'flat'                  │         │
│   └─────────────────┬───────────────────────────────┘         │
│                     │                                           │
│                     ▼                                           │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 5. Find or Create Unit                          │         │
│   │    Query: WHERE unit_identifier = value         │         │
│   │           AND street_id = street.id             │         │
│   │    ✓ Exists → Skip (increment skippedCount)     │         │
│   │    ✗ Not exists → Create new                    │         │
│   │    Increment unitsCreated if new                │         │
│   │    Increment successCount                       │         │
│   └─────────────────┬───────────────────────────────┘         │
│                     │                                           │
│                     ▼                                           │
│   ┌─────────────────────────────────────────────────┐         │
│   │ 6. Handle Errors                                │         │
│   │    Catch any exceptions                         │         │
│   │    Add to errors array with:                    │         │
│   │    - row number                                 │         │
│   │    - row data                                   │         │
│   │    - error reason                               │         │
│   └─────────────────────────────────────────────────┘         │
│                                                                 │
│   END FOR EACH                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CREATE AUDIT RECORD                           │
│                                                                 │
│   INSERT INTO bulk_upload_jobs:                                │
│   - userId                                                      │
│   - uploadType: 'streets_units'                                │
│   - filename                                                    │
│   - totalProcessed                                             │
│   - successCount                                               │
│   - streetsCreated                                             │
│   - unitsCreated                                               │
│   - skippedCount                                               │
│   - errors                                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMMIT DATABASE TRANSACTION                        │
│                                                                 │
│   ✓ All changes persisted                                      │
│   ✓ Audit record saved                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUILD RESPONSE                                │
│                                                                 │
│   {                                                             │
│     status: "success",                                          │
│     message: "Bulk streets/units upload completed",            │
│     data: {                                                     │
│       estateCode: "SG001",                                     │
│       estateId: "uuid",                                        │
│       estateName: "Sunset Gardens",                            │
│       totalProcessed: 50,                                      │
│       successCount: 48,                                        │
│       streetsCreated: 5,                                       │
│       unitsCreated: 48,                                        │
│       skippedCount: 2,                                         │
│       errorCount: 0,                                           │
│       errors: []                                               │
│     }                                                           │
│   }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RETURN TO CLIENT                              │
│                                                                 │
│   HTTP 200 OK                                                   │
│   Content-Type: application/json                               │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION FAILURE
   ├─ Invalid token → HTTP 401 Unauthorized
   └─ Expired token → HTTP 401 Unauthorized

2. PERMISSION DENIED
   ├─ Manager uploading to different estate → HTTP 403 Forbidden
   └─ Insufficient role → HTTP 403 Forbidden

3. VALIDATION ERRORS
   ├─ No file provided → HTTP 400 Bad Request
   ├─ Invalid file format → HTTP 400 Bad Request
   ├─ Missing estateCode → HTTP 400 Bad Request
   └─ File too large → HTTP 400 Bad Request

4. ESTATE NOT FOUND
   └─ Invalid estate code → HTTP 400 Bad Request
      Transaction rolled back
      No data persisted

5. PROCESSING ERRORS
   ├─ Missing required field (row-level)
   │  └─ Add to errors array, continue processing
   ├─ Invalid data format (row-level)
   │  └─ Add to errors array, continue processing
   └─ Database error (transaction-level)
      └─ Rollback transaction, HTTP 500 Internal Server Error

6. PARTIAL SUCCESS
   └─ Some rows succeed, some fail
      ├─ Successful rows committed
      ├─ Failed rows in errors array
      └─ HTTP 200 OK with error details
```

## Data Flow Diagram

```
┌──────────────┐
│   CSV File   │
│              │
│ street_name  │
│ unit_id      │
│ unit_type    │
│ block        │
│ floor        │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│         Estate Code: SG001           │
│                                      │
│         Lookup Estate                │
│         ↓                            │
│    Estate ID: uuid-123               │
│    Estate Name: Sunset Gardens       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│         Process Streets              │
│                                      │
│  Main Street    → street_id: uuid-1  │
│  Oak Avenue     → street_id: uuid-2  │
│  Park Lane      → street_id: uuid-3  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│         Process Units                │
│                                      │
│  A101 (Main St)  → unit_id: uuid-a   │
│  A102 (Main St)  → unit_id: uuid-b   │
│  B101 (Oak Ave)  → unit_id: uuid-c   │
│  C1 (Park Lane)  → unit_id: uuid-d   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│         Database Structure           │
│                                      │
│  Estate (SG001)                      │
│    ├─ Street: Main Street            │
│    │    ├─ Unit: A101 (flat)         │
│    │    └─ Unit: A102 (flat)         │
│    ├─ Street: Oak Avenue             │
│    │    └─ Unit: B101 (apartment)    │
│    └─ Street: Park Lane              │
│         └─ Unit: C1 (house)          │
└──────────────────────────────────────┘
```

## Deduplication Logic

```
┌─────────────────────────────────────────────────────────────────┐
│              UNIT DEDUPLICATION STRATEGY                        │
└─────────────────────────────────────────────────────────────────┘

Composite Key: (unit_identifier, street_id)

Example 1: DIFFERENT STREETS (Both Created)
┌──────────────────────────────────────┐
│ Row 1: A101, Main Street             │ → Creates unit_1
│ Row 2: A101, Oak Avenue              │ → Creates unit_2
└──────────────────────────────────────┘
✓ Different street_id → Both units created

Example 2: SAME STREET (Second Skipped)
┌──────────────────────────────────────┐
│ Row 1: A101, Main Street             │ → Creates unit_1
│ Row 2: A101, Main Street             │ → Skipped (duplicate)
└──────────────────────────────────────┘
✗ Same (unit_identifier, street_id) → Second skipped

Example 3: CASE SENSITIVITY
┌──────────────────────────────────────┐
│ Row 1: A101, Main Street             │ → Creates unit_1
│ Row 2: a101, Main Street             │ → Creates unit_2
└──────────────────────────────────────┘
✓ Different case → Both units created
(unit_identifier is case-sensitive)
```

## Permission Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERMISSION MATRIX                             │
└─────────────────────────────────────────────────────────────────┘

Role: MANAGER
├─ Own Estate (estate_code matches)
│  └─ ✓ ALLOWED
└─ Different Estate
   └─ ✗ FORBIDDEN (403)

Role: ADMIN
├─ Any Estate
│  └─ ✓ ALLOWED
└─ No restrictions

Role: SUPER_ADMIN
├─ Any Estate
│  └─ ✓ ALLOWED
└─ No restrictions

Role: MASTER
├─ Any Estate
│  └─ ✓ ALLOWED
└─ No restrictions

Role: RESIDENT
└─ ✗ FORBIDDEN (403)
   (Endpoint requires Manager or higher)
```

## Transaction Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSACTION SCOPE                             │
└─────────────────────────────────────────────────────────────────┘

BEGIN TRANSACTION
│
├─ Estate Lookup (SELECT)
│  └─ If not found → ROLLBACK
│
├─ FOR EACH ROW:
│  ├─ Find/Create Street (SELECT/INSERT)
│  └─ Find/Create Unit (SELECT/INSERT)
│
├─ Create Audit Record (INSERT)
│
└─ COMMIT TRANSACTION

All operations succeed or all fail together.
No partial database state.
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE PROFILE                           │
└─────────────────────────────────────────────────────────────────┘

File Size: 500 rows
├─ Parse Time: ~0.5s
├─ Estate Lookup: ~10ms
├─ Row Processing: ~5s (100 rows/sec)
├─ Audit Record: ~10ms
└─ Total: ~6s

Bottlenecks:
├─ Database queries (findOrCreate per row)
├─ Transaction commit time
└─ File parsing for large files

Optimizations:
├─ Batch inserts (future enhancement)
├─ Street caching within transaction
└─ Parallel processing (future enhancement)
```

---

## Legend

```
┌─────┐
│ Box │  = Process or Component
└─────┘

   │
   ▼     = Flow Direction

   ✓     = Success/Allowed
   ✗     = Failure/Denied
   →     = Transformation
```
