# Lockwise Bulk Upload Sample Data Structure

This file demonstrates the hierarchical relationship between Estates, Streets, and Units for bulk uploading.

## 📊 Data Hierarchy

```
ESTATE (Parent)
├── STREET 1
│   ├── UNIT A101
│   ├── UNIT A102
│   └── UNIT A103
├── STREET 2
│   ├── UNIT B101
│   └── UNIT B102
└── STREET 3
    ├── UNIT C101
    └── UNIT C102
```

## 📁 File Dependencies

1. **estates-bulk-sample.csv** - Upload first (creates estate records)
2. **streets-bulk-sample.csv** - Upload second (references estate_id from step 1)
3. **units-bulk-sample.csv** - Upload third (references street_id from step 2)

## 🎯 Sample Data Relationships

### Estate Record (from estates-bulk-sample.csv)
```
estate_id: "660e8400-e29b-41d4-a716-446655440000"
name: "Sunset Gardens Estate"
```

### Street Records (from streets-bulk-sample.csv)
```
street_id: Generated UUID
estate_id: "660e8400-e29b-41d4-a716-446655440000" (links to estate above)
name: "Sunset Boulevard"
```

### Unit Records (from units-bulk-sample.csv)
```
unit_id: Generated UUID
street_id: Links to street record above
unit_identifier: "A101"
```

## 📋 Required Fields Summary

### Estates
- **Required**: name, address, type, city, state, country
- **Optional**: country_code, timezone, currency_code, postal_code, etc.

### Streets
- **Required**: estate_id (UUID), name
- **Generated**: street_id (UUID)

### Units
- **Required**: street_id (UUID), unit_identifier
- **Optional**: block, floor, unit_type, status, coordinates, etc.

## ⚠️ Important Notes

1. **UUID References**: Use actual UUIDs from created records when linking data
2. **Validation**: All required fields must be present and valid
3. **Order Matters**: Upload in hierarchical order (Estate → Street → Unit)
4. **Unique Identifiers**: unit_identifier must be unique within each estate
5. **Status Values**: Use predefined enum values for unit_type and status fields

## 🛠️ Bulk Upload Process

1. Prepare CSV files with your actual data
2. Upload estates first to get estate_id values
3. Create streets using the estate_id references
4. Create units using the street_id references
5. Verify relationships in the database

This structure ensures data integrity and proper hierarchical organization of your property management system.