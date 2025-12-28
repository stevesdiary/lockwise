# Bulk Upload Implementation

## Overview
Comprehensive bulk upload system for estates, residents, and address data using Excel/CSV file parsing with transaction-based processing.

## How Parsing Works

### 1. **File Processing Pipeline**
```
Excel/CSV File → XLSX.js Parser → Row Mapping → Validation → Database Transaction → Result
```

### 2. **Parsing Implementation**
- **XLSX.js Library**: Handles both Excel (.xlsx, .xls) and CSV files
- **Buffer Processing**: Files processed in memory for security
- **Sheet Reading**: Automatically reads first sheet of Excel files
- **JSON Conversion**: Converts rows to JavaScript objects

### 3. **Row Mapping Strategy**
Each data type has flexible column mapping:

#### Estate Mapping
```typescript
{
  name: row['Name'] || row['name'] || row['Estate Name'],
  address: row['Address'] || row['address'],
  type: row['Type'] || row['type'] || 'residential',
  city: row['City'] || row['city'],
  // ... flexible column name matching
}
```

#### Resident Mapping
```typescript
{
  user_id: row['User ID'] || row['user_id'],
  estate_id: row['Estate ID'] || row['estate_id'],
  unit_id: row['Unit ID'] || row['unit_id'],
  move_in_date: new Date(row['Move In Date']),
  // ... date parsing and validation
}
```

#### Address Mapping
```typescript
{
  estate_id: estateId, // Provided via API
  apartment_number: row['Apartment'] || row['Unit'],
  street: row['Street'] || row['street'],
  available: Boolean(row['Available']),
  // ... boolean conversion
}
```

## API Endpoints

### Bulk Upload Endpoints
- `POST /api/v1/bulk-upload/estates` - Upload estate data
- `POST /api/v1/bulk-upload/residents` - Upload resident data  
- `POST /api/v1/bulk-upload/addresses` - Upload address data (requires estateId)

### Template Endpoint
- `GET /api/v1/bulk-upload/template/{type}` - Get template format and sample data

## File Format Requirements

### Supported Formats
- Excel: `.xlsx`, `.xls`
- CSV: `.csv`
- Max file size: 10MB

### Estate Template
| Name | Address | Type | City | State | Country | Estate Code | Apartments | Floors |
|------|---------|------|------|-------|---------|-------------|------------|--------|
| Sunset Gardens | 123 Main St | residential | Lagos | Lagos | Nigeria | SG001 | 50 | 10 |

### Resident Template
| User ID | Estate ID | Unit ID | Move In Date | Lease Start | Lease End | Emergency Contact | Emergency Phone | Status |
|---------|-----------|---------|--------------|-------------|-----------|-------------------|-----------------|--------|
| user_123 | estate_456 | unit_789 | 2024-01-01 | 2024-01-01 | 2024-12-31 | John Doe | +2348012345678 | active |

### Address Template
| Street | Building | Apartment | City | State | Country | Zip | Available |
|--------|----------|-----------|------|-------|---------|-----|-----------|
| Main Street | Block A | A101 | Lagos | Lagos | Nigeria | 100001 | true |

## Processing Features

### 1. **Transaction-Based Processing**
- All operations wrapped in database transactions
- Rollback on any failure ensures data consistency
- Batch processing for performance

### 2. **Error Handling**
- Row-level error tracking
- Detailed error messages with row numbers
- Partial success support (successful rows saved, errors reported)

### 3. **Validation**
- Required field validation
- Data type validation
- Format validation (dates, booleans, enums)
- Duplicate prevention

### 4. **Flexible Column Mapping**
- Multiple column name variations supported
- Case-insensitive matching
- Common aliases recognized

## Response Format

### Successful Upload
```json
{
  "status": "success",
  "message": "Bulk estate upload completed",
  "data": {
    "totalProcessed": 100,
    "successCount": 95,
    "errorCount": 5,
    "created": [...], // Array of created records
    "errors": [
      {
        "row": 3,
        "data": {...},
        "reason": "Estate name is required"
      }
    ]
  }
}
```

### Template Response
```json
{
  "status": "success",
  "data": {
    "type": "estates",
    "headers": ["Name", "Address", "Type", ...],
    "sampleData": ["Sunset Gardens", "123 Main St", ...],
    "instructions": "Name and Address are required..."
  }
}
```

## Usage Examples

### Upload Estates
```javascript
const formData = new FormData();
formData.append('file', estateFile);

fetch('/api/v1/bulk-upload/estates', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Upload Addresses for Estate
```javascript
const formData = new FormData();
formData.append('file', addressFile);
formData.append('estateId', 'estate_123');

fetch('/api/v1/bulk-upload/addresses', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Get Template
```javascript
fetch('/api/v1/bulk-upload/template/estates')
  .then(res => res.json())
  .then(data => {
    console.log('Headers:', data.data.headers);
    console.log('Sample:', data.data.sampleData);
  });
```

## Data Processing Flow

### 1. **File Upload**
- File received via multipart/form-data
- Stored in memory buffer
- Format validation performed

### 2. **Parsing**
- XLSX.js reads file buffer
- First sheet extracted
- Rows converted to JSON objects

### 3. **Row Processing**
- Each row mapped to data structure
- Field validation performed
- Required fields checked

### 4. **Database Operations**
- Transaction started
- Records created/updated
- Success/error tracking

### 5. **Response Generation**
- Results compiled
- Error details included
- Statistics calculated

## Benefits

1. **Efficient Bulk Operations**: Process hundreds of records in single request
2. **Data Integrity**: Transaction-based processing ensures consistency
3. **Flexible Input**: Supports multiple file formats and column variations
4. **Error Transparency**: Detailed error reporting with row-level details
5. **Template Support**: Built-in templates for easy data preparation
6. **Partial Success**: Successful records saved even if some fail
7. **Security**: File validation and memory-based processing

This implementation provides a robust, user-friendly bulk upload system that handles real-world data variations while maintaining data integrity.