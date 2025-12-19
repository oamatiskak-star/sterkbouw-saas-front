export function isActiveRoute(current, target) {
  if (current === target) return true
  if (current.startsWith(target + "/")) return true
  return false
}
