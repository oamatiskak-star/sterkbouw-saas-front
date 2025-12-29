// src/components/dashboard/overview-cards.tsx
import { Building, Calculator, Users, CreditCard, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface OverviewCardsProps {
  stats?: {
    totalProjects: number
    activeProjects: number
    totalCalculaties: number
    pendingCalculaties: number
    totalKlanten: number
    revenue: number
    invoices: {
      paid: number
      pending: number
      overdue: number
    }
  }
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: "Projecten",
      value: stats?.totalProjects || 0,
      subValue: `${stats?.activeProjects || 0} actief`,
      icon: Building,
      color: "bg-blue-500",
      trend: "+12%",
      href: "/projecten"
    },
    {
      title: "Calculaties",
      value: stats?.totalCalculaties || 0,
      subValue: `${stats?.pendingCalculaties || 0} in behandeling`,
      icon: Calculator,
      color: "bg-green-500",
      trend: "+24%",
      href: "/calculaties"
    },
    {
      title: "Klanten",
      value: stats?.totalKlanten || 0,
      subValue: "42 actieve klanten",
      icon: Users,
      color: "bg-purple-500",
      trend: "+8%",
      href: "/klanten"
    },
    {
      title: "Omzet",
      value: `€${(stats?.revenue || 0).toLocaleString()}`,
      subValue: "YTD totaal",
      icon: CreditCard,
      color: "bg-amber-500",
      trend: "+18%",
      href: "/facturatie"
    },
    {
      title: "Facturatie",
      value: `${stats?.invoices.paid || 0}/${(stats?.invoices.paid || 0) + (stats?.invoices.pending || 0)}`,
      subValue: `${stats?.invoices.overdue || 0} achterstallig`,
      icon: AlertCircle,
      color: "bg-red-500",
      trend: stats?.invoices.overdue ? "-" : "+",
      href: "/facturatie"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.subValue}</p>
              </div>
              <div className={`${card.color} h-12 w-12 rounded-lg flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <a 
                href={card.href}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Bekijk details →
              </a>
              <div className={`flex items-center text-sm ${card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${card.trend.startsWith('-') ? 'transform rotate-180' : ''}`} />
                {card.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
