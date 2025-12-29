// src/components/dashboard/calculatie-stats.tsx
import { TrendingUp, TrendingDown, Calculator, FileText, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CalculatieStatsProps {
  stats?: {
    thisMonth: {
      calculaties: number
      revenue: number
      projects: number
    }
    lastMonth: {
      calculaties: number
      revenue: number
      projects: number
    }
  }
}

export function CalculatieStats({ stats }: CalculatieStatsProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  const metrics = [
    {
      label: "Calculaties",
      icon: Calculator,
      current: stats?.thisMonth.calculaties || 0,
      previous: stats?.lastMonth.calculaties || 0,
      color: "text-blue-600"
    },
    {
      label: "Projecten",
      icon: FileText,
      current: stats?.thisMonth.projects || 0,
      previous: stats?.lastMonth.projects || 0,
      color: "text-green-600"
    },
    {
      label: "Omzet",
      icon: CreditCard,
      current: stats?.thisMonth.revenue || 0,
      previous: stats?.lastMonth.revenue || 0,
      color: "text-purple-600",
      format: (value: number) => `€${value.toLocaleString()}`
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculatie Statistieken</CardTitle>
        <p className="text-sm text-gray-500">Vergelijking met vorige maand</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous)
            const isPositive = change >= 0
            const Icon = metric.icon
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${metric.color.replace('text', 'bg')} bg-opacity-10 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.format ? metric.format(metric.current) : metric.current}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
