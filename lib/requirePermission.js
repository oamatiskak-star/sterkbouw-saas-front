// lib/requirePermission.js
import { hasPermission } from './permissions'

export function requirePermission({ user, roles, appScope, permission }) {
  return hasPermission({ user, roles, appScope, permission })
}
