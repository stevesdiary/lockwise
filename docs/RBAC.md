# Role-Based Access Control (RBAC) System

## Roles

- **super_admin**: Full system access
- **admin**: Estate administration
- **manager**: Estate management
- **security**: Security operations
- **resident**: Resident access
- **domestic_staff**: Staff access

## Permissions

- **approve**: Approve/reject items
- **read**: View/read access
- **create**: Create new items
- **update**: Modify existing items
- **delete**: Remove items

## Usage Examples

### In Routes

```typescript
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Resource, Permission } from '../constants/permissions';

// Single permission check
router.post('/users', 
  authenticateToken,
  requirePermission(Resource.USERS, Permission.CREATE),
  userController.createUser
);

// Multiple permissions (any)
router.get('/users/:id',
  authenticateToken,
  requireAnyPermission(Resource.USERS, [Permission.READ, Permission.UPDATE]),
  userController.getUser
);

// Multiple permissions (all required)
router.delete('/users/:id',
  authenticateToken,
  requireAllPermissions(Resource.USERS, [Permission.DELETE, Permission.APPROVE]),
  userController.deleteUser
);
```

### In Controllers

```typescript
import { hasPermission, UserRole, Resource, Permission } from '../constants/permissions';

// Check permission programmatically
if (hasPermission(UserRole.MANAGER, Resource.ESTATES, Permission.UPDATE)) {
  // Allow update
}

// Get all permissions for a role
const permissions = getPermissions(UserRole.RESIDENT, Resource.ACCESS_CODES);

// Check if role can access resource
if (canAccess(UserRole.SECURITY, Resource.ACCESS_LOGS)) {
  // Allow access
}
```

## Permission Matrix

| Role | Users | Estates | Access Codes | Payments | Emergency |
|------|-------|---------|--------------|----------|-----------|
| super_admin | All | All | All | All | All |
| admin | CRUD+Approve | RU | CRUD | CRU | CR |
| manager | CRU | RU | CRU | CR | CR |
| security | R | R | CR | - | CR |
| resident | R | R | CR | CR | CR |
| domestic_staff | R | R | R | - | R |
