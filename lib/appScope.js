// lib/appScope.js
export function detectAppScope(hostname) {
  if (!hostname) return 'dashboard'

  const host = hostname.toLowerCase()

  if (host.startsWith('app.')) return 'dashboard'
  if (host.startsWith('ontwikkeling.')) return 'ontwikkeling'
  if (host.startsWith('bouwplaats.')) return 'bouwplaats'
  if (host.startsWith('projectportaal.')) return 'projectportaal'

  // fallback
  return 'dashboard'
}

export function getAppScopeFromRequest(req) {
  const host =
    req?.headers?.host ||
    req?.headers?.get?.('host') ||
    ''
  return detectAppScope(host)
}
