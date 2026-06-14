# Quick Start: Bulk Upload Streets & Units for EST005

## Estate Information
- **Estate Code**: EST005
- **Estate Name**: (Your estate name)

## Step-by-Step Upload

### 1. Choose Your File Format

Three sample files are provided for EST005:
- `EST005-streets-units-sample.csv` (440 bytes)
- `EST005-streets-units-sample.xlsx` (18 KB)
- `EST005-streets-units-sample.xls` (5 KB)

### 2. Edit the Sample File

Open any of the sample files and modify the data:

```csv
street_name,unit_identifier,unit_type,block,floor
Admiralty Way,A101,flat,A,1
Admiralty Way,A102,flat,A,1
Lekki Phase 1,B101,duplex,B,1
Victoria Island,C101,apartment,C,1
```

**Required columns:**
- `street_name` - Name of the street (e.g., "Admiralty Way")
- `unit_identifier` - Unique unit ID (e.g., "A101", "B202")

**Optional columns:**
- `unit_type` - flat, duplex, apartment, house, terrace, chalet, plot, other (defaults to "flat")
- `block` - Block identifier (e.g., "A", "B", "Tower 1")
- `floor` - Floor number (e.g., 1, 2, 3)

### 3. Upload via API

```bash
curl -X POST http://localhost:3000/api/bulk-upload/streets-units \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "estateCode=EST005" \
  -F "file=@EST005-streets-units-sample.csv"
```

### 4. Upload via Portal

1. Log in to the manager portal
2. Navigate to Bulk Upload section
3. Select "Streets & Units Upload"
4. Enter estate code: **EST005**
5. Choose file: `EST005-streets-units-sample.csv` (or .xlsx/.xls)
6. Click "Upload"

### 5. Review Results

The system will return:
```json
{
  "totalProcessed": 20,
  "successCount": 20,
  "streetsCreated": 5,
  "unitsCreated": 20,
  "skippedCount": 0,
  "errors": [],
  "estateId": "uuid-of-EST005",
  "estateName": "Your Estate Name"
}
```

## Sample Data Included

The EST005 sample file contains:
- **5 streets**: Admiralty Way, Lekki Phase 1, Victoria Island, Ikoyi Crescent, Banana Island
- **20 units**: Mix of flats, duplexes, apartments, terraces, and houses
- **Blocks**: A, B, C, D, E
- **Floors**: 1-2 (where applicable)

## Common Issues

### "Estate code required"
**Solution**: Make sure you're passing `estateCode=EST005` in the request body

### "Estate with code 'EST005' not found"
**Solution**: Verify EST005 exists in your database:
```sql
SELECT estate_id, name, estate_code FROM estates WHERE estate_code = 'EST005';
```

### "street_name is required"
**Solution**: Ensure every row has a street_name value (no empty cells)

### "unit_identifier is required"
**Solution**: Ensure every row has a unit_identifier value (no empty cells)

## Tips

1. **Start small**: Test with 5-10 rows first
2. **No duplicates**: Same unit_identifier on same street will be skipped
3. **Different streets OK**: Same unit_identifier can exist on different streets
4. **Case sensitive**: Street names are case-sensitive ("Main St" ≠ "main st")
5. **Empty optional fields**: Leave block and floor empty if not applicable

## Next Steps

After successful upload:
1. Verify streets created: `GET /api/estates/EST005/streets`
2. Verify units created: `GET /api/streets/{street_id}/units`
3. Assign residents to units
4. Configure access control for each unit

## Need Help?

- See full documentation: `BULK_UPLOAD_STREETS_UNITS_FORMAT.md`
- Check API logs for detailed error messages
- Contact support with your bulk upload job ID
