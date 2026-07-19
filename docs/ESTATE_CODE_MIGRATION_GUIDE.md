# Migration Guide: Estate ID to Estate Code

## Overview
The streets and units bulk upload endpoint has been updated to use `estateCode` instead of `estateId` for improved usability and integration.

## What Changed?

### Request Parameter
| Before | After |
|--------|-------|
| `estateId` (UUID) | `estateCode` (string) |
| `"a1b2c3d4-e5f6-..."` | `"SG001"` |

### Response Data
Added fields:
- `estateCode` - The estate code used in the request
- `estateId` - The UUID of the estate (for reference)
- `estateName` - The name of the estate

## Migration Steps

### Step 1: Identify Your Estate Code
```javascript
// Option A: Query your estate
GET /api/v1/estates/{estateId}

Response:
{
  "estate_id": "uuid",
  "estate_code": "SG001",  // Use this value
  "name": "Sunset Gardens"
}

// Option B: List all estates
GET /api/v1/estates

Response:
{
  "estates": [
    {
      "estate_id": "uuid",
      "estate_code": "SG001",  // Use this value
      "name": "Sunset Gardens"
    }
  ]
}
```

### Step 2: Update Your Code

#### Before (Old Code)
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('estateId', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

fetch('/api/v1/bulk-upload/streets-units', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

#### After (New Code)
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('estateCode', 'SG001');  // Changed parameter name and value

fetch('/api/v1/bulk-upload/streets-units', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Step 3: Update Response Handling

#### Before (Old Response)
```javascript
const result = await response.json();
console.log(`Processed ${result.data.totalProcessed} rows`);
console.log(`Created ${result.data.unitsCreated} units`);
```

#### After (New Response)
```javascript
const result = await response.json();
console.log(`Estate: ${result.data.estateName} (${result.data.estateCode})`);
console.log(`Processed ${result.data.totalProcessed} rows`);
console.log(`Created ${result.data.unitsCreated} units`);
// New fields available: estateCode, estateId, estateName
```

## Code Examples by Language

### JavaScript/TypeScript
```typescript
// Before
async function uploadStreetsUnits(file: File, estateId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('estateId', estateId);
  
  return fetch('/api/v1/bulk-upload/streets-units', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
}

// After
async function uploadStreetsUnits(file: File, estateCode: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('estateCode', estateCode);  // Changed
  
  const response = await fetch('/api/v1/bulk-upload/streets-units', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const result = await response.json();
  return {
    ...result,
    // New fields available
    estateCode: result.data.estateCode,
    estateId: result.data.estateId,
    estateName: result.data.estateName
  };
}
```

### Python
```python
# Before
def upload_streets_units(file_path, estate_id):
    files = {'file': open(file_path, 'rb')}
    data = {'estateId': estate_id}
    headers = {'Authorization': f'Bearer {token}'}
    
    return requests.post(
        'https://api.lockwise.app/api/v1/bulk-upload/streets-units',
        files=files,
        data=data,
        headers=headers
    )

# After
def upload_streets_units(file_path, estate_code):
    files = {'file': open(file_path, 'rb')}
    data = {'estateCode': estate_code}  # Changed
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.post(
        'https://api.lockwise.app/api/v1/bulk-upload/streets-units',
        files=files,
        data=data,
        headers=headers
    )
    
    result = response.json()
    print(f"Estate: {result['data']['estateName']} ({result['data']['estateCode']})")
    return result
```

### cURL
```bash
# Before
curl -X POST https://api.lockwise.app/api/v1/bulk-upload/streets-units \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@streets-units.xlsx" \
  -F "estateId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# After
curl -X POST https://api.lockwise.app/api/v1/bulk-upload/streets-units \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@streets-units.xlsx" \
  -F "estateCode=SG001"
```

## Error Handling Updates

### New Error: Estate Not Found
```json
{
  "status": "error",
  "message": "Estate with code 'INVALID' not found"
}
```

**Handling**:
```javascript
try {
  const result = await uploadStreetsUnits(file, estateCode);
  // Success
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Invalid estate code. Please verify and try again.');
  }
}
```

### Updated Error: Missing Parameter
```json
{
  "status": "error",
  "message": "estateCode is required"
}
```

## Testing Your Migration

### 1. Test with Sample Data
```javascript
// Use the sample template
const sampleFile = 'streets-units-bulk-upload-sample.csv';
const testEstateCode = 'SG001';  // Your test estate code

const result = await uploadStreetsUnits(sampleFile, testEstateCode);
console.log('Migration test successful:', result);
```

### 2. Verify Response Format
```javascript
const result = await uploadStreetsUnits(file, estateCode);

// Check new fields exist
assert(result.data.estateCode === estateCode);
assert(result.data.estateId !== undefined);
assert(result.data.estateName !== undefined);

// Check existing fields still work
assert(result.data.totalProcessed !== undefined);
assert(result.data.successCount !== undefined);
```

### 3. Test Error Cases
```javascript
// Test invalid estate code
try {
  await uploadStreetsUnits(file, 'INVALID');
  assert(false, 'Should have thrown error');
} catch (error) {
  assert(error.message.includes('not found'));
}

// Test missing estate code
try {
  await uploadStreetsUnits(file, '');
  assert(false, 'Should have thrown error');
} catch (error) {
  assert(error.message.includes('required'));
}
```

## Rollback Plan

If you need to temporarily support both formats:

```javascript
async function uploadStreetsUnits(file, estateIdentifier) {
  // Detect if it's a UUID or estate code
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(estateIdentifier);
  
  let estateCode;
  if (isUUID) {
    // Convert UUID to estate code
    const estate = await fetch(`/api/v1/estates/${estateIdentifier}`).then(r => r.json());
    estateCode = estate.estate_code;
  } else {
    estateCode = estateIdentifier;
  }
  
  // Use estate code
  const formData = new FormData();
  formData.append('file', file);
  formData.append('estateCode', estateCode);
  
  return fetch('/api/v1/bulk-upload/streets-units', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
}
```

## FAQ

### Q: Do I need to update my database?
**A**: No, the database schema hasn't changed. This is only an API parameter change.

### Q: Will my old code break?
**A**: Yes, if you're using `estateId` parameter, you need to update to `estateCode`.

### Q: Can I still use estate UUIDs elsewhere?
**A**: Yes, this change only affects the streets-units bulk upload endpoint. Other endpoints are unchanged.

### Q: What if my estate doesn't have an estate_code?
**A**: Contact your system administrator to assign an estate code to your estate.

### Q: How do I find my estate code?
**A**: Query the estates endpoint or check your estate details in the admin panel.

### Q: Is the estate code case-sensitive?
**A**: Yes, estate codes are case-sensitive. Use the exact code as stored in the database.

### Q: Can I change my estate code?
**A**: Contact your system administrator. Estate codes should be stable once assigned.

## Support

If you encounter issues during migration:

1. **Verify Estate Code**: Ensure your estate has a valid estate_code
2. **Check Permissions**: Managers can only upload to their own estate
3. **Test with Sample**: Use the provided sample template first
4. **Review Errors**: Check error messages for specific issues
5. **Contact Support**: Provide estate code and error details

## Timeline

- **Effective Date**: Immediate
- **Deprecation**: Old `estateId` parameter no longer supported
- **Support**: Available for migration assistance

## Checklist

- [ ] Identified estate code for each estate
- [ ] Updated API calls to use `estateCode`
- [ ] Updated response handling for new fields
- [ ] Tested with sample data
- [ ] Verified error handling
- [ ] Updated documentation
- [ ] Deployed changes to production
- [ ] Monitored for issues

## Additional Resources

- [Comprehensive Guide](./STREETS_UNITS_BULK_UPLOAD.md)
- [Quick Reference](./STREETS_UNITS_QUICK_REF.md)
- [Sample Template](../sample-files/template/streets-units-bulk-upload-sample.csv)
- [Implementation Summary](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md)
