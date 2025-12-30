// config/appScope.ts

export type AppScope =
  | 'dashboard'
  | 'projectportaal'
  | 'ontwikkeling'
  | 'bouwplaats'

export function getAppScopeFromHost(host: string): AppScope {
  if (host.startsWith('app.')) return 'dashboard'
  if (host.startsWith('projectportaal.')) return 'projectportaal'
  if (host.startsWith('ontwikkeling.')) return 'ontwikkeling'
  if (host.startsWith('bouwplaats.')) return 'bouwplaats'

  throw new Error('ONBEKEND_DOMEIN')
}
