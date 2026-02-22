# Lockwise Sample Files Directory Structure

## 📁 Current Organization

```
sample-files/
├── template/                    # All CSV templates
│   ├── access-codes-bulk-sample.csv
│   ├── estate-addresses-sample.csv
│   ├── estates-bulk-sample.csv
│   ├── resident-addresses-sample.csv
│   ├── streets-bulk-sample.csv
│   ├── units-bulk-sample.csv
│   └── users-bulk-upload-sample.csv
├── .env.sample                 # Environment configuration
├── api-configuration-sample.json # API endpoints
├── bulk-upload-guide.md        # Hierarchical upload guide
├── seed-data.sql              # Database seeding
└── README.md                  # Main documentation
```

## 📋 File Categories

### 📊 CSV Templates (template/ folder)
All bulk upload templates are organized in the `template/` folder:
- **access-codes-bulk-sample.csv** - Guest access code generation
- **estate-addresses-sample.csv** - Basic estate registration
- **estates-bulk-sample.csv** - Comprehensive estate data with all fields
- **resident-addresses-sample.csv** - Resident registration with addresses
- **streets-bulk-sample.csv** - Street creation for estates
- **units-bulk-sample.csv** - Detailed unit/property specifications
- **users-bulk-upload-sample.csv** - User account bulk creation

### ⚙️ Configuration Files (Root)
- **.env.sample** - Environment variables template
- **api-configuration-sample.json** - API endpoints and requests
- **seed-data.sql** - Initial database seeding script

### 📚 Documentation (Root)
- **README.md** - Main onboarding guide
- **bulk-upload-guide.md** - Detailed hierarchical data upload instructions

## 🚀 Usage Instructions

1. **For bulk uploads**: Navigate to the `template/` folder
2. **For configuration**: Use files in the root directory
3. **For documentation**: Refer to README.md and bulk-upload-guide.md

This organization keeps template files separate from configuration and documentation for better maintainability.