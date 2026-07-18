# Streets & Units Bulk Upload Guide

## Overview
Bulk upload streets and units for an estate using the estate code. This feature allows estate managers and admins to quickly populate their estate structure with streets and residential units.

## Key Features
- **Estate Code Mapping**: Uses human-readable estate codes (e.g., `SG001`) instead of UUIDs
- **Automatic Street Creation**: Creates streets if they don't exist
- **Unit Deduplication**: Prevents duplicate units based on `(unit_identifier, street_id)` composite key
- **Flexible Unit Types**: Supports flat, duplex, chalet, terrace, plot, house, apartment, other
- **Transaction Safety**: All operations wrapped in database transaction
- **Permission Control**: Managers can only upload to their own estate

## API Endpoint

```
POST /api/v1/bulk-upload/streets-units
```

### Request Parameters
- **file** (multipart/form-data): Excel (.xlsx, .xls) or CSV file
- **estateCode** (form field): Estate code (e.g., `SG001`)

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## File Format

### Required Columns
| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| street_name | string | Yes | Name of the street |
| unit_identifier | string | Yes | Unique identifier for the unit (e.g., A101, B205) |
| unit_type | string | No | Type of unit (defaults to 'flat') |
| block | string | No | Block identifier (e.g., A, B, C) |
| floor | number | No | Floor number |

### Supported Unit Types
- `flat` (default)
- `duplex`
- `chalet`
- `terrace`
- `plot`
- `house`
- `apartment`
- `other`

### Column Name Variations
The system accepts multiple column name formats:
- **street_name**: `street_name`, `Street Name`, `Street`
- **unit_identifier**: `unit_identifier`, `Unit`, `Unit ID`, `Unit Identifier`
- **unit_type**: `unit_type`, `Type`
- **block**: `block`, `Block`
- **floor**: `floor`, `Floor`

## Sample File

### Excel/CSV Template
```csv
street_name,unit_identifier,unit_type,block,floor
Main Street,A101,flat,A,1
Main Street,A102,flat,A,1
Main Street,A201,duplex,A,2
Oak Avenue,B101,apartment,B,1
Oak Avenue,B102,apartment,B,1
Park Lane,C1,house,,
Garden Road,D15,plot,,
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Bulk streets/units upload completed",
  "data": {
    "estateCode": "SG001",
    "estateId": "uuid-of-estate",
    "estateName": "Sunset Gardens",
    "totalProcessed": 50,
    "successCount": 48,
    "streetsCreated": 5,
    "unitsCreated": 48,
    "skippedCount": 2,
    "errorCount": 0,
    "errors": []
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Estate with code 'INVALID' not found"
}
```

### Validation Errors
```json
{
  "status": "success",
  "message": "Bulk streets/units upload completed",
  "data": {
    "estateCode": "SG001",
    "totalProcessed": 10,
    "successCount": 8,
    "streetsCreated": 2,
    "unitsCreated": 8,
    "skippedCount": 0,
    "errorCount": 2,
    "errors": [
      {
        "row": 3,
        "data": { "street_name": "", "unit_identifier": "A101" },
        "reason": "street_name is required"
      },
      {
        "row": 7,
        "data": { "street_name": "Main St", "unit_identifier": "" },
        "reason": "unit_identifier is required"
      }
    ]
  }
}
```

## Usage Examples

### JavaScript/TypeScript
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('estateCode', 'SG001');

const response = await fetch('/api/v1/bulk-upload/streets-units', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(`Created ${result.data.streetsCreated} streets and ${result.data.unitsCreated} units`);
```

### cURL
```bash
curl -X POST https://api.lockwise.app/api/v1/bulk-upload/streets-units \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@streets-units.xlsx" \
  -F "estateCode=SG001"
```

### Python
```python
import requests

files = {'file': open('streets-units.xlsx', 'rb')}
data = {'estateCode': 'SG001'}
headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'https://api.lockwise.app/api/v1/bulk-upload/streets-units',
    files=files,
    data=data,
    headers=headers
)

result = response.json()
print(f"Created {result['data']['streetsCreated']} streets")
print(f"Created {result['data']['unitsCreated']} units")
```

## Processing Logic

### 1. Estate Lookup
- System looks up estate by `estate_code`
- Returns error if estate not found
- Extracts `estate_id` for subsequent operations

### 2. Street Processing
- For each unique `street_name` in the file:
  - Check if street exists for this estate
  - Create street if it doesn't exist
  - Link street to estate via `estate_id`

### 3. Unit Processing
- For each row:
  - Find or create the street
  - Validate `unit_type` (defaults to 'flat' if invalid)
  - Parse `floor` as integer (null if empty/invalid)
  - Check for existing unit with same `(unit_identifier, street_id)`
  - Create unit if it doesn't exist
  - Skip if unit already exists (prevents duplicates)

### 4. Deduplication Strategy
Units are deduplicated based on composite key:
- `unit_identifier` + `street_id`

This means:
- ✅ `A101` on "Main Street" and `A101` on "Oak Avenue" are different units
- ❌ Two `A101` units on the same "Main Street" will result in one being skipped

## Permission Rules

### Estate Managers
- Can only upload to their own estate
- System verifies `estate_code` matches manager's assigned estate
- Returns 403 Forbidden if attempting to upload to different estate

### Admins & Super Admins
- Can upload to any estate
- No estate ownership verification required

## Best Practices

### 1. Prepare Your Data
- Ensure all street names are consistent
- Use clear unit identifiers (e.g., A101, B205)
- Validate unit types before upload
- Remove duplicate rows

### 2. Test with Small Batch
- Start with 5-10 rows to verify format
- Check response for any errors
- Adjust file format if needed
- Upload full dataset once validated

### 3. Handle Errors
- Review error messages for each failed row
- Common issues:
  - Missing required fields
  - Invalid estate code
  - Duplicate units (will be skipped)
- Fix errors and re-upload failed rows

### 4. Verify Results
- Check `streetsCreated` and `unitsCreated` counts
- Review `skippedCount` for duplicates
- Query estate to verify all data loaded correctly

## Common Issues & Solutions

### Issue: "Estate with code 'XXX' not found"
**Solution**: Verify the estate code exists in the system. Check for typos or extra spaces.

### Issue: High `skippedCount`
**Solution**: Units with duplicate `(unit_identifier, street_id)` are skipped. This is normal if re-uploading the same file.

### Issue: "You can only upload to your own estate"
**Solution**: Managers can only upload to their assigned estate. Verify you're using the correct estate code.

### Issue: All units showing as 'flat' type
**Solution**: Check that `unit_type` column values match supported types exactly (case-insensitive). Invalid types default to 'flat'.

### Issue: Floor numbers not saving
**Solution**: Ensure floor column contains numeric values. Empty or non-numeric values will be stored as null.

## Database Schema

### Streets Table
```sql
CREATE TABLE streets (
  street_id UUID PRIMARY KEY,
  estate_id UUID REFERENCES estates(estate_id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Units Table
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY,
  street_id UUID REFERENCES streets(street_id),
  unit_identifier VARCHAR NOT NULL,
  unit_type VARCHAR DEFAULT 'flat',
  block VARCHAR,
  floor INTEGER,
  status VARCHAR DEFAULT 'vacant',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(unit_identifier, street_id)
);
```

## Integration with Other Features

### Resident Assignment
Once units are created, residents can be assigned to specific units using:
- Manual assignment via admin panel
- Bulk resident upload with unit references
- Self-service resident registration

### Access Control
Units are used for:
- Gate access verification
- Visitor management
- Delivery tracking
- Service requests

### Reporting
Unit data enables:
- Occupancy reports
- Vacancy tracking
- Unit type distribution
- Floor-wise analytics

## Performance Considerations

- **Batch Size**: Recommended max 500 rows per file
- **Processing Time**: ~100 rows per second
- **Transaction Timeout**: 30 seconds
- **File Size Limit**: 10MB

For larger datasets:
1. Split into multiple files
2. Upload sequentially
3. Monitor success/error counts
4. Verify data integrity after each batch

## Security

- All uploads require authentication
- Estate managers restricted to their own estate
- File validation prevents malicious uploads
- Transaction rollback on any failure
- Audit trail via bulk_upload_jobs table

## Support

For issues or questions:
- Check error messages in response
- Review this documentation
- Contact system administrator
- Submit support ticket with:
  - Estate code
  - Sample file (first 5 rows)
  - Error response
  - User role and permissions
