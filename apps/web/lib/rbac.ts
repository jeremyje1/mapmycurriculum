import { getSession } from './auth'

// Define available roles in the system
export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// Define permissions for each feature
export enum Permission {
  // Program management
  VIEW_PROGRAMS = 'view_programs',
  CREATE_PROGRAMS = 'create_programs',
  EDIT_PROGRAMS = 'edit_programs',
  DELETE_PROGRAMS = 'delete_programs',
  
  // Course management
  VIEW_COURSES = 'view_courses',
  CREATE_COURSES = 'create_courses',
  EDIT_COURSES = 'edit_courses',
  DELETE_COURSES = 'delete_courses',
  
  // Scenario management
  VIEW_SCENARIOS = 'view_scenarios',
  CREATE_SCENARIOS = 'create_scenarios',
  EDIT_SCENARIOS = 'edit_scenarios',
  DELETE_SCENARIOS = 'delete_scenarios',
  APPLY_SCENARIOS = 'apply_scenarios',
  
  // Compliance & reporting
  VIEW_COMPLIANCE = 'view_compliance',
  RUN_COMPLIANCE = 'run_compliance',
  ACKNOWLEDGE_ALERTS = 'acknowledge_alerts',
  GENERATE_REPORTS = 'generate_reports',
  
  // User & institution management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_INSTITUTION = 'manage_institution',
  
  // Billing
  VIEW_BILLING = 'view_billing',
  MANAGE_BILLING = 'manage_billing',
}

// Role-based permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admins have all permissions
    Permission.VIEW_PROGRAMS,
    Permission.CREATE_PROGRAMS,
    Permission.EDIT_PROGRAMS,
    Permission.DELETE_PROGRAMS,
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.DELETE_COURSES,
    Permission.VIEW_SCENARIOS,
    Permission.CREATE_SCENARIOS,
    Permission.EDIT_SCENARIOS,
    Permission.DELETE_SCENARIOS,
    Permission.APPLY_SCENARIOS,
    Permission.VIEW_COMPLIANCE,
    Permission.RUN_COMPLIANCE,
    Permission.ACKNOWLEDGE_ALERTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_INSTITUTION,
    Permission.VIEW_BILLING,
    Permission.MANAGE_BILLING,
  ],
  [Role.EDITOR]: [
    // Editors can manage programs, courses, scenarios
    Permission.VIEW_PROGRAMS,
    Permission.CREATE_PROGRAMS,
    Permission.EDIT_PROGRAMS,
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.VIEW_SCENARIOS,
    Permission.CREATE_SCENARIOS,
    Permission.EDIT_SCENARIOS,
    Permission.VIEW_COMPLIANCE,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_USERS,
  ],
  [Role.VIEWER]: [
    // Viewers can only view, not edit
    Permission.VIEW_PROGRAMS,
    Permission.VIEW_COURSES,
    Permission.VIEW_SCENARIOS,
    Permission.VIEW_COMPLIANCE,
    Permission.GENERATE_REPORTS,
  ],
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] || []
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role)
  return permissions.includes(permission)
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  
  if (!session?.user?.role) {
    return false
  }
  
  const userRole = session.user.role as Role
  return roleHasPermission(userRole, permission)
}

/**
 * Check if the current user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const checks = await Promise.all(permissions.map(p => hasPermission(p)))
  return checks.some(result => result)
}

/**
 * Check if the current user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const checks = await Promise.all(permissions.map(p => hasPermission(p)))
  return checks.every(result => result)
}

/**
 * Require specific permission - throws error if not authorized
 * Use in Server Actions and API routes
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await hasPermission(permission)
  
  if (!allowed) {
    throw new Error(`Insufficient permissions: ${permission} required`)
  }
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissions: Permission[]): Promise<void> {
  const allowed = await hasAnyPermission(permissions)
  
  if (!allowed) {
    throw new Error(`Insufficient permissions: one of [${permissions.join(', ')}] required`)
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<Role | null> {
  const session = await getSession()
  return (session?.user?.role as Role) || null
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === Role.ADMIN
}

/**
 * Check if user is editor or higher
 */
export async function canEdit(): Promise<boolean> {
  const role = await getUserRole()
  return role === Role.ADMIN || role === Role.EDITOR
}

/**
 * Helper to check permissions in React Server Components
 */
export async function checkAccess(config: {
  permission?: Permission
  anyPermissions?: Permission[]
  allPermissions?: Permission[]
  role?: Role
}): Promise<boolean> {
  const session = await getSession()
  
  if (!session) {
    return false
  }

  // Check specific role
  if (config.role && session.user.role !== config.role) {
    return false
  }

  // Check single permission
  if (config.permission) {
    return await hasPermission(config.permission)
  }

  // Check any permissions
  if (config.anyPermissions) {
    return await hasAnyPermission(config.anyPermissions)
  }

  // Check all permissions
  if (config.allPermissions) {
    return await hasAllPermissions(config.allPermissions)
  }

  return true
}
