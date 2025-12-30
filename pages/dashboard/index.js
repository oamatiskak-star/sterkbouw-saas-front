import { useRouter } from 'next/router'
import { useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [loading] = useState(false)

  const kpis = [
    { label: 'Actieve projecten', value: '12' },
    { label: 'Open calculaties', value: '8' },
    { label: 'Open issues', value: '3' },
    { label: 'Totale cashflow', value: '€2.8M' }
  ]

  const quickActions = [
    { label: 'Nieuwe calculatie', path: '/calculatie/nieuw' },
    { label: 'Nieuw project', path: '/projecten/nieuw' },
    { label: 'Financiering', path: '/financien/aanvraag' },
    { label: 'Bouwinspectie', path: '/bouwplaats/inspectie' }
  ]

  const modules = [
    { label: 'Calculatie & Offertes', desc: 'Kosten & offertes', path: '/calculatie' },
    { label: 'Projecten', desc: 'Projectmanagement', path: '/projecten' },
    { label: 'BIM', desc: '3D & tekeningen', path: '/bim' },
    { label: 'Bouwplaats', desc: 'Uitvoering', path: '/bouwplaats' },
    { label: 'Documenten', desc: 'Bestanden', path: '/documenten' },
    { label: 'Financiën', desc: 'Budget & cashflow', path: '/financien' },
    { label: 'Planning', desc: 'Tijd & fases', path: '/planning' },
    { label: 'Projectportaal', desc: 'Opdrachtgevers', path: '/projectportaal' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Overzicht en directe sturing van het SterkBouw platform
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/calculatie')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Naar calculatie
          </button>
          <button
            onClick={() => router.push('/projecten/nieuw')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Nieuw project
          </button>
        </div>
      </div>

      {/* KPI’s */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            className="bg-white border rounded p-4 shadow-sm"
          >
            <div className="text-sm text-gray-500">{kpi.label}</div>
            <div className="text-xl font-bold">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Snelle acties */}
      <div className="bg-white border rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">Snelle acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => router.push(action.path)}
              className="border rounded p-4 text-left hover:bg-gray-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="bg-white border rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">Alle modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {modules.map(module => (
            <div
              key={module.path}
              onClick={() => router.push(module.path)}
              className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-semibold">{module.label}</div>
              <div className="text-sm text-gray-500">{module.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
