# Bulk Upload Documentation Index

## Overview
Complete documentation for the Lockwise bulk upload system, with focus on the estate code-based streets and units upload feature.

## Quick Start

**New to bulk uploads?** Start here:
1. [Quick Reference Guide](./STREETS_UNITS_QUICK_REF.md) - Get started in 5 minutes
2. [Sample Template](../sample-files/template/streets-units-bulk-upload-sample.csv) - Download and use
3. [Comprehensive Guide](./STREETS_UNITS_BULK_UPLOAD.md) - Deep dive when needed

**Migrating from estate IDs?** Go here:
- [Migration Guide](./ESTATE_CODE_MIGRATION_GUIDE.md) - Step-by-step migration

## Documentation Structure

### 📚 User Guides

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [STREETS_UNITS_QUICK_REF.md](./STREETS_UNITS_QUICK_REF.md) | Quick reference | All users | 1 page |
| [STREETS_UNITS_BULK_UPLOAD.md](./STREETS_UNITS_BULK_UPLOAD.md) | Complete guide | Developers | 15 pages |
| [ESTATE_CODE_MIGRATION_GUIDE.md](./ESTATE_CODE_MIGRATION_GUIDE.md) | Migration steps | Existing clients | 8 pages |

### 🔧 Technical Documentation

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [STREETS_UNITS_IMPLEMENTATION_SUMMARY.md](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md) | Implementation details | Developers | 12 pages |
| [STREETS_UNITS_FLOW_DIAGRAM.md](./STREETS_UNITS_FLOW_DIAGRAM.md) | Visual flow diagrams | Developers | 6 pages |
| [BULK_UPLOAD_ESTATE_CODE_COMPLETE.md](./BULK_UPLOAD_ESTATE_CODE_COMPLETE.md) | Complete summary | All | 5 pages |

### 📋 General Bulk Upload

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [BULK_UPLOAD_IMPLEMENTATION.md](./BULK_UPLOAD_IMPLEMENTATION.md) | All bulk uploads | Developers | 10 pages |

### 📄 Templates & Samples

| File | Purpose | Format |
|------|---------|--------|
| [streets-units-bulk-upload-sample.csv](../sample-files/template/streets-units-bulk-upload-sample.csv) | Sample template | CSV |
| [users-bulk-upload-sample.csv](../sample-files/template/users-bulk-upload-sample.csv) | User upload template | CSV |

## Documentation by Use Case

### I want to upload streets and units
1. **Quick Start**: [Quick Reference](./STREETS_UNITS_QUICK_REF.md)
2. **Download**: [Sample Template](../sample-files/template/streets-units-bulk-upload-sample.csv)
3. **Detailed Help**: [Complete Guide](./STREETS_UNITS_BULK_UPLOAD.md)

### I'm migrating from estate IDs
1. **Migration Steps**: [Migration Guide](./ESTATE_CODE_MIGRATION_GUIDE.md)
2. **What Changed**: [Implementation Summary](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md)
3. **Testing**: [Complete Guide - Testing Section](./STREETS_UNITS_BULK_UPLOAD.md#testing)

### I'm integrating the API
1. **API Docs**: [Complete Guide - API Section](./STREETS_UNITS_BULK_UPLOAD.md#api-endpoint)
2. **Code Examples**: [Complete Guide - Usage Examples](./STREETS_UNITS_BULK_UPLOAD.md#usage-examples)
3. **Error Handling**: [Complete Guide - Common Issues](./STREETS_UNITS_BULK_UPLOAD.md#common-issues--solutions)

### I'm debugging an issue
1. **Common Issues**: [Complete Guide - Troubleshooting](./STREETS_UNITS_BULK_UPLOAD.md#common-issues--solutions)
2. **Flow Diagram**: [Flow Diagram - Error Handling](./STREETS_UNITS_FLOW_DIAGRAM.md#error-handling-flow)
3. **Support**: [Complete Guide - Support Section](./STREETS_UNITS_BULK_UPLOAD.md#support)

### I'm a developer working on the code
1. **Implementation**: [Implementation Summary](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md)
2. **Flow Diagrams**: [Flow Diagram](./STREETS_UNITS_FLOW_DIAGRAM.md)
3. **Testing**: [Implementation Summary - Testing](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md#testing-checklist)

## API Endpoints Reference

### Streets & Units Upload
```
POST /api/v1/bulk-upload/streets-units
```
- **Docs**: [Complete Guide](./STREETS_UNITS_BULK_UPLOAD.md#api-endpoint)
- **Quick Ref**: [Quick Reference](./STREETS_UNITS_QUICK_REF.md)
- **Template**: [Sample CSV](../sample-files/template/streets-units-bulk-upload-sample.csv)

### Other Bulk Uploads
```
POST /api/v1/bulk-upload/estates
POST /api/v1/bulk-upload/residents
POST /api/v1/bulk-upload/addresses
```
- **Docs**: [General Bulk Upload](./BULK_UPLOAD_IMPLEMENTATION.md)

### Template Download
```
GET /api/v1/bulk-upload/template/{type}
```
- **Docs**: [General Bulk Upload](./BULK_UPLOAD_IMPLEMENTATION.md#template-endpoint)

## Key Concepts

### Estate Code
- Human-readable identifier (e.g., `SG001`)
- Unique per estate
- Used instead of UUID for better usability
- **Learn more**: [Complete Guide - Estate Code](./STREETS_UNITS_BULK_UPLOAD.md#key-features)

### Deduplication
- Units deduplicated by `(unit_identifier, street_id)`
- Streets deduplicated by `(name, estate_id)`
- **Learn more**: [Flow Diagram - Deduplication](./STREETS_UNITS_FLOW_DIAGRAM.md#deduplication-logic)

### Permissions
- Managers: Own estate only
- Admins: Any estate
- **Learn more**: [Complete Guide - Permission Rules](./STREETS_UNITS_BULK_UPLOAD.md#permission-rules)

### Transaction Safety
- All operations in single transaction
- All succeed or all fail
- **Learn more**: [Flow Diagram - Transactions](./STREETS_UNITS_FLOW_DIAGRAM.md#transaction-boundaries)

## Common Tasks

### Download Sample Template
```bash
curl -O https://api.lockwise.app/sample-files/template/streets-units-bulk-upload-sample.csv
```

### Upload Streets & Units
```bash
curl -X POST https://api.lockwise.app/api/v1/bulk-upload/streets-units \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@streets-units.xlsx" \
  -F "estateCode=SG001"
```

### Get Template Format
```bash
curl https://api.lockwise.app/api/v1/bulk-upload/template/streets-units
```

## Code Examples

### JavaScript
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('estateCode', 'SG001');

const response = await fetch('/api/v1/bulk-upload/streets-units', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```
**More examples**: [Complete Guide - Usage Examples](./STREETS_UNITS_BULK_UPLOAD.md#usage-examples)

### Python
```python
files = {'file': open('streets-units.xlsx', 'rb')}
data = {'estateCode': 'SG001'}
headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'https://api.lockwise.app/api/v1/bulk-upload/streets-units',
    files=files,
    data=data,
    headers=headers
)
```
**More examples**: [Complete Guide - Usage Examples](./STREETS_UNITS_BULK_UPLOAD.md#usage-examples)

## File Format

### Required Columns
- `street_name` - Name of the street
- `unit_identifier` - Unique identifier for the unit

### Optional Columns
- `unit_type` - Type of unit (flat, duplex, etc.)
- `block` - Block identifier
- `floor` - Floor number

**Full specification**: [Complete Guide - File Format](./STREETS_UNITS_BULK_UPLOAD.md#file-format)

## Support & Troubleshooting

### Common Issues
| Issue | Solution | Reference |
|-------|----------|-----------|
| Estate not found | Verify estate code | [Troubleshooting](./STREETS_UNITS_BULK_UPLOAD.md#issue-estate-with-code-xxx-not-found) |
| Permission denied | Check estate ownership | [Troubleshooting](./STREETS_UNITS_BULK_UPLOAD.md#issue-you-can-only-upload-to-your-own-estate) |
| High skipped count | Duplicate units | [Troubleshooting](./STREETS_UNITS_BULK_UPLOAD.md#issue-high-skippedcount) |

### Getting Help
1. Check [Common Issues](./STREETS_UNITS_BULK_UPLOAD.md#common-issues--solutions)
2. Review [Flow Diagram](./STREETS_UNITS_FLOW_DIAGRAM.md)
3. Contact support with:
   - Estate code
   - Sample file (first 5 rows)
   - Error response
   - User role

## Version History

### v2.0 (Current) - Estate Code Based
- Uses `estateCode` parameter
- Returns estate details in response
- Enhanced permission checks
- **Migration**: [Migration Guide](./ESTATE_CODE_MIGRATION_GUIDE.md)

### v1.0 (Legacy) - Estate ID Based
- Used `estateId` parameter (UUID)
- Basic permission checks
- **Deprecated**: No longer supported

## Related Features

### Estate Management
- Estate creation and configuration
- Estate code assignment
- Estate settings

### Access Control
- Gate access verification
- Visitor management
- Delivery tracking

### Reporting
- Occupancy reports
- Vacancy tracking
- Unit analytics

## Contributing

### For Developers
- Follow existing patterns in [Implementation Summary](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md)
- Add tests for new features
- Update documentation
- Follow [Queue Rules](../.amazonq/rules/Queue.md) for async work

### For Documentation
- Keep examples up to date
- Add new use cases
- Improve clarity
- Fix errors

## Additional Resources

### Internal Documentation
- [Queue Rules](../.amazonq/rules/Queue.md) - Async work patterns
- [API Documentation](./API.md) - Full API reference
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure

### External Resources
- [XLSX.js Documentation](https://docs.sheetjs.com/) - File parsing library
- [Sequelize Documentation](https://sequelize.org/) - ORM documentation
- [Express.js Documentation](https://expressjs.com/) - Web framework

## Quick Links

| Link | Description |
|------|-------------|
| [Quick Start](./STREETS_UNITS_QUICK_REF.md) | Get started in 5 minutes |
| [Sample Template](../sample-files/template/streets-units-bulk-upload-sample.csv) | Download CSV template |
| [Complete Guide](./STREETS_UNITS_BULK_UPLOAD.md) | Full documentation |
| [Migration Guide](./ESTATE_CODE_MIGRATION_GUIDE.md) | Migrate from estate IDs |
| [Flow Diagram](./STREETS_UNITS_FLOW_DIAGRAM.md) | Visual process flow |
| [Implementation](./STREETS_UNITS_IMPLEMENTATION_SUMMARY.md) | Technical details |

---

## Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Quick Reference | ✅ Complete | 2024 |
| Complete Guide | ✅ Complete | 2024 |
| Migration Guide | ✅ Complete | 2024 |
| Implementation Summary | ✅ Complete | 2024 |
| Flow Diagram | ✅ Complete | 2024 |
| Sample Template | ✅ Complete | 2024 |

**All documentation is current and ready for use.**

---

**Need help?** Start with the [Quick Reference](./STREETS_UNITS_QUICK_REF.md) or jump to the [Complete Guide](./STREETS_UNITS_BULK_UPLOAD.md).
