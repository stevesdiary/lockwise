# Streets & Units Bulk Upload - Quick Reference

## Endpoint
```
POST /api/v1/bulk-upload/streets-units
```

## Request
```bash
curl -X POST https://api.lockwise.app/api/v1/bulk-upload/streets-units \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@streets-units.xlsx" \
  -F "estateCode=SG001"
```

## Required Fields
| Field | Type | Example |
|-------|------|---------|
| estateCode | string | SG001 |
| file | .xlsx/.xls/.csv | streets-units.xlsx |

## CSV Format
```csv
street_name,unit_identifier,unit_type,block,floor
Main Street,A101,flat,A,1
Oak Avenue,B205,duplex,B,2
```

## Unit Types
- flat (default)
- duplex
- chalet
- terrace
- plot
- house
- apartment
- other

## Response
```json
{
  "status": "success",
  "data": {
    "estateCode": "SG001",
    "estateId": "uuid",
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

## Permissions
- **Managers**: Own estate only (verified by estate_code)
- **Admins**: Any estate

## Key Features
✅ Estate code mapping (human-readable)  
✅ Auto-creates streets  
✅ Deduplicates units by (unit_identifier, street_id)  
✅ Transaction-safe  
✅ Flexible column names  
✅ Invalid unit_type defaults to 'flat'  

## Common Errors
| Error | Solution |
|-------|----------|
| Estate not found | Verify estate code |
| Missing street_name | Add street name to row |
| Missing unit_identifier | Add unit identifier to row |
| Permission denied | Use correct estate code for your estate |

## Download Template
[streets-units-bulk-upload-sample.csv](../sample-files/template/streets-units-bulk-upload-sample.csv)

## Full Documentation
See [STREETS_UNITS_BULK_UPLOAD.md](./STREETS_UNITS_BULK_UPLOAD.md) for complete guide.
