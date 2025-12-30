// lib/permissions.js
export const ADMIN_EMAIL = 'o.amatiskak@sterkbouw.nl'

export const ROLES = {
  ADMIN: 'admin',
  INTERNAL: 'internal_user',
  CUSTOMER: 'customer',
  FIELD: 'field_user',
  CLIENT: 'client',
}

export const APP_SCOPES = {
  DASHBOARD: 'dashboard',
  ONTWIKKELING: 'ontwikkeling',
  BOUWPLAATS: 'bouwplaats',
  PROJECTPORTAAL: 'projectportaal',
}

// Basistoegang per app
export const APP_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.INTERNAL],
  ontwikkeling: [ROLES.ADMIN, ROLES.CUSTOMER, ROLES.INTERNAL],
  bouwplaats: [ROLES.ADMIN, ROLES.FIELD],
  projectportaal: [ROLES.ADMIN, ROLES.CLIENT],
}

export function isAdmin(user) {
  return !!user && user.email === ADMIN_EMAIL
}

export function hasAppAccess({ user, roles = [], appScope }) {
  if (!user) return false
  if (isAdmin(user)) return true

  const allowed = APP_ACCESS[appScope] || []
  return roles.some(r => allowed.includes(r))
}

// Fijnmazige permissies per module/actie
export function hasPermission({ user, roles = [], permission, appScope }) {
  if (!user) return false
  if (isAdmin(user)) return true

  // Basis app-gate
  if (!hasAppAccess({ user, roles, appScope })) return false

  // Uitbreidbaar: permission-matrix
  // Voor nu: app-toegang is voldoende
  return true
}
