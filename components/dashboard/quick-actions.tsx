// src/components/dashboard/quick-actions.tsx
import { 
  Calculator, 
  Upload, 
  FileText, 
  Send, 
  Settings, 
  Users,
  Building,
  CreditCard
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: Calculator,
      label: "Nieuwe Calculatie",
      description: "Creëer een AI-gestuurde calculatie",
      color: "bg-blue-100 text-blue-600",
      onClick: () => router.push('/calculaties/nieuw')
    },
    {
      icon: Upload,
      label: "Upload Documenten",
      description: "Upload bouwtekeningen voor analyse",
      color: "bg-green-100 text-green-600",
      onClick: () => router.push('/documenten/upload')
    },
    {
      icon: FileText,
      label: "Offerte Genereren",
      description: "Maak een professionele offerte",
      color: "bg-purple-100 text-purple-600",
      onClick: () => router.push('/offerte/nieuw')
    },
    {
      icon: Send,
      label: "Factuur Sturen",
      description: "Verstuur factuur naar klant",
      color: "bg-amber-100 text-amber-600",
      onClick: () => router.push('/facturatie/nieuw')
    },
    {
      icon: Users,
      label: "Klant Toevoegen",
      description: "Voeg nieuwe klant toe",
      color: "bg-pink-100 text-pink-600",
      onClick: () => router.push('/klanten/nieuw')
    },
    {
      icon: Building,
      label: "Nieuw Project",
      description: "Start een nieuw bouwproject",
      color: "bg-indigo-100 text-indigo-600",
      onClick: () => router.push('/projecten/nieuw')
    },
    {
      icon: CreditCard,
      label: "Abonnement",
      description: "Beheer je subscription",
      color: "bg-emerald-100 text-emerald-600",
      onClick: () => router.push('/instellingen/abonnement')
    },
    {
      icon: Settings,
      label: "Instellingen",
      description: "Pas je voorkeuren aan",
      color: "bg-gray-100 text-gray-600",
      onClick: () => router.push('/instellingen')
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snel Acties</CardTitle>
        <p className="text-sm text-gray-500">Direct naar belangrijke functies</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`${action.color} h-12 w-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm text-center mb-1">{action.label}</span>
              <span className="text-xs text-gray-500 text-center">{action.description}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
