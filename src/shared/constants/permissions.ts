export enum UserRole {
  MASTER = 'master',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SECURITY = 'security',
  RESIDENT = 'resident',
  DOMESTIC_STAFF = 'domestic_staff',
  CUSTOMER_SERVICE = 'customer_service'
}

export enum Permission {
  APPROVE = 'approve',
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum Resource {
  USERS = 'users',
  ESTATES = 'estates',
  RESIDENTS = 'residents',
  ACCESS_CODES = 'access_codes',
  ACCESS_LOGS = 'access_logs',
  PAYMENTS = 'payments',
  SUBSCRIPTIONS = 'subscriptions',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  STREETS = 'streets',
  UNITS = 'units',
  NOTIFICATIONS = 'notifications',
  SUPPORT_TICKETS = 'support_tickets',
  EMERGENCY_ALERTS = 'emergency_alerts',
  COMMUNITY_BOARD = 'community_board',
  ANALYTICS = 'analytics',
  REPORTS = 'reports',
  SETTINGS = 'settings'
}

export const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Permission[]>> = {
  [UserRole.MASTER]: {
    [Resource.USERS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ESTATES]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.RESIDENTS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ACCESS_LOGS]: [Permission.READ, Permission.DELETE],
    [Resource.PAYMENTS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.SUBSCRIPTIONS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ROLES]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.PERMISSIONS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.STREETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.UNITS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.NOTIFICATIONS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.COMMUNITY_BOARD]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ANALYTICS]: [Permission.READ],
    [Resource.REPORTS]: [Permission.READ, Permission.CREATE],
    [Resource.SETTINGS]: [Permission.READ, Permission.UPDATE]
  },
  [UserRole.SUPER_ADMIN]: {
    [Resource.USERS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ESTATES]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.RESIDENTS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ACCESS_LOGS]: [Permission.READ, Permission.DELETE],
    [Resource.PAYMENTS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.SUBSCRIPTIONS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ROLES]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.PERMISSIONS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.STREETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.UNITS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.NOTIFICATIONS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.COMMUNITY_BOARD]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ANALYTICS]: [Permission.READ],
    [Resource.REPORTS]: [Permission.READ, Permission.CREATE],
    [Resource.SETTINGS]: [Permission.READ, Permission.UPDATE]
  },

  [UserRole.ADMIN]: {
    [Resource.USERS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ESTATES]: [Permission.READ, Permission.UPDATE],
    [Resource.RESIDENTS]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ACCESS_LOGS]: [Permission.READ],
    [Resource.PAYMENTS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.SUBSCRIPTIONS]: [Permission.READ, Permission.UPDATE],
    [Resource.ROLES]: [Permission.READ],
    [Resource.PERMISSIONS]: [Permission.READ],
    [Resource.STREETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.UNITS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.NOTIFICATIONS]: [Permission.READ, Permission.CREATE],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE],
    [Resource.COMMUNITY_BOARD]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE],
    [Resource.ANALYTICS]: [Permission.READ],
    [Resource.REPORTS]: [Permission.READ, Permission.CREATE],
    [Resource.SETTINGS]: [Permission.READ, Permission.UPDATE]
  },

  [UserRole.MANAGER]: {
    [Resource.USERS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ESTATES]: [Permission.READ, Permission.UPDATE],
    [Resource.RESIDENTS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ACCESS_LOGS]: [Permission.READ],
    [Resource.PAYMENTS]: [Permission.READ, Permission.CREATE],
    [Resource.SUBSCRIPTIONS]: [Permission.READ],
    [Resource.ROLES]: [Permission.READ, Permission.UPDATE],
    [Resource.PERMISSIONS]: [Permission.READ],
    [Resource.STREETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.UNITS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.NOTIFICATIONS]: [Permission.READ, Permission.CREATE],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE],
    [Resource.COMMUNITY_BOARD]: [Permission.APPROVE, Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.ANALYTICS]: [Permission.READ],
    [Resource.REPORTS]: [Permission.READ, Permission.CREATE],
    [Resource.SETTINGS]: [Permission.READ]
  },

  [UserRole.SECURITY]: {
    [Resource.USERS]: [Permission.READ],
    [Resource.ESTATES]: [Permission.READ],
    [Resource.RESIDENTS]: [Permission.READ],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE],
    [Resource.ACCESS_LOGS]: [Permission.READ, Permission.CREATE],
    [Resource.PAYMENTS]: [],
    [Resource.SUBSCRIPTIONS]: [],
    [Resource.ROLES]: [],
    [Resource.PERMISSIONS]: [],
    [Resource.STREETS]: [Permission.READ],
    [Resource.UNITS]: [Permission.READ],
    [Resource.NOTIFICATIONS]: [Permission.READ],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE],
    [Resource.COMMUNITY_BOARD]: [Permission.READ],
    [Resource.ANALYTICS]: [],
    [Resource.REPORTS]: [Permission.READ],
    [Resource.SETTINGS]: []
  },

  [UserRole.RESIDENT]: {
    [Resource.USERS]: [Permission.READ],
    [Resource.ESTATES]: [Permission.READ],
    [Resource.RESIDENTS]: [Permission.READ],
    [Resource.ACCESS_CODES]: [Permission.READ, Permission.CREATE],
    [Resource.ACCESS_LOGS]: [Permission.READ],
    [Resource.PAYMENTS]: [Permission.READ, Permission.CREATE],
    [Resource.SUBSCRIPTIONS]: [Permission.READ],
    [Resource.ROLES]: [],
    [Resource.PERMISSIONS]: [],
    [Resource.STREETS]: [Permission.READ],
    [Resource.UNITS]: [Permission.READ],
    [Resource.NOTIFICATIONS]: [Permission.READ],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ, Permission.CREATE],
    [Resource.COMMUNITY_BOARD]: [Permission.READ, Permission.CREATE],
    [Resource.ANALYTICS]: [],
    [Resource.REPORTS]: [],
    [Resource.SETTINGS]: [Permission.READ, Permission.UPDATE]
  },

  [UserRole.DOMESTIC_STAFF]: {
    [Resource.USERS]: [Permission.READ],
    [Resource.ESTATES]: [Permission.READ],
    [Resource.RESIDENTS]: [Permission.READ],
    [Resource.ACCESS_CODES]: [Permission.READ],
    [Resource.ACCESS_LOGS]: [Permission.READ],
    [Resource.PAYMENTS]: [],
    [Resource.SUBSCRIPTIONS]: [],
    [Resource.ROLES]: [],
    [Resource.PERMISSIONS]: [],
    [Resource.STREETS]: [Permission.READ],
    [Resource.UNITS]: [Permission.READ],
    [Resource.NOTIFICATIONS]: [Permission.READ],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ],
    [Resource.COMMUNITY_BOARD]: [Permission.READ],
    [Resource.ANALYTICS]: [],
    [Resource.REPORTS]: [],
    [Resource.SETTINGS]: []
  },

  [UserRole.CUSTOMER_SERVICE]: {
    [Resource.USERS]: [Permission.READ],
    [Resource.ESTATES]: [Permission.READ],
    [Resource.RESIDENTS]: [Permission.READ],
    [Resource.ACCESS_CODES]: [Permission.READ],
    [Resource.ACCESS_LOGS]: [Permission.READ],
    [Resource.PAYMENTS]: [Permission.READ],
    [Resource.SUBSCRIPTIONS]: [Permission.READ],
    [Resource.ROLES]: [],
    [Resource.PERMISSIONS]: [],
    [Resource.STREETS]: [Permission.READ],
    [Resource.UNITS]: [Permission.READ],
    [Resource.NOTIFICATIONS]: [Permission.READ, Permission.CREATE],
    [Resource.SUPPORT_TICKETS]: [Permission.READ, Permission.CREATE, Permission.UPDATE],
    [Resource.EMERGENCY_ALERTS]: [Permission.READ],
    [Resource.COMMUNITY_BOARD]: [Permission.READ],
    [Resource.ANALYTICS]: [],
    [Resource.REPORTS]: [],
    [Resource.SETTINGS]: []
  }
};

export function hasPermission(role: UserRole, resource: Resource, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(permission);
}

export function getPermissions(role: UserRole, resource: Resource): Permission[] {
  return ROLE_PERMISSIONS[role]?.[resource] || [];
}

export function canAccess(role: UserRole, resource: Resource): boolean {
  const permissions = getPermissions(role, resource);
  return permissions.length > 0;
}
