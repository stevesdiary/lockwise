# Swagger Documentation Structure

This directory contains the modular Swagger/OpenAPI documentation for Lockwise API.

## File Organization

- **index.ts** - Main configuration file that combines all modules
- **schemas.ts** - All schema definitions (request/response models)
- **paths.ts** - All API endpoint definitions organized by domain

## How to Add New Endpoints

### 1. Add Schema (if needed)
In `schemas.ts`, add your schema definition:

```typescript
export const schemas = {
  // ... existing schemas
  YourNewSchema: {
    type: 'object',
    required: ['field1'],
    properties: {
      field1: { type: 'string', example: 'value' }
    }
  }
};
```

### 2. Add Path Definition
In `paths.ts`, add to the appropriate section:

```typescript
export const yourDomainPaths = {
  '/your-endpoint': {
    post: {
      tags: ['YourTag'],
      summary: 'Your endpoint summary',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/YourNewSchema' }
          }
        }
      },
      responses: {
        '200': { description: 'Success' },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};
```

### 3. Import in index.ts
Make sure your new paths are imported and spread in the main `paths` object.

## Benefits of This Structure

1. **Maintainability** - Each domain has its own section
2. **Readability** - Easier to find and update specific endpoints
3. **Collaboration** - Multiple developers can work on different sections
4. **Build Performance** - Smaller files compile faster
5. **Git Conflicts** - Reduced merge conflicts

## Migration TODO

The current swagger.ts has 3000+ lines. To complete the migration:

1. Copy all schema definitions from old swagger.ts to `schemas.ts`
2. Group and copy path definitions to appropriate sections in `paths.ts`
3. Test that the Swagger UI still works correctly
4. Delete the old monolithic swagger.ts content

## Testing

After making changes, verify:
1. `npm run build` succeeds
2. Visit `/api-docs` and check all endpoints appear
3. Test a few endpoints using the Swagger UI
