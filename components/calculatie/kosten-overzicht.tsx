// components/calculatie/kosten-overzicht.tsx
import { Calculator, TrendingUp, AlertCircle } from "lucide-react"

interface KostenOverzichtProps {
  subtotaal: number
  opslagen: {
    algemene_kosten: number
    bouwplaatskosten: number
    winstopslag: number
    risicofactor: number
  }
  btw_percentage: number
}

export function KostenOverzicht({ subtotaal, opslagen, btw_percentage }: KostenOverzichtProps) {
  const totaalOpslagen = Object.values(opslagen).reduce((a, b) => a + b, 0)
  const totaalExclBtw = subtotaal + totaalOpslagen
  const btwBedrag = totaalExclBtw * (btw_percentage / 100)
  const totaalInclBtw = totaalExclBtw + btwBedrag

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Financiële Samenvatting</h3>
          <Calculator className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Subtotaal */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Subtotaal werkzaamheden</p>
            <p className="text-sm text-gray-500">Berekend op basis van posten</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">€{subtotaal.toFixed(2)}</p>
          </div>
        </div>

        {/* Opslagen */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Toeslagen & Opslagen</h4>
          <div className="space-y-1">
            {Object.entries(opslagen).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                <span className="font-medium">€{value.toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between font-medium">
                <span>Totaal opslagen:</span>
                <span>€{totaalOpslagen.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BTW */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-blue-800">BTW ({btw_percentage}%)</p>
              <p className="text-sm text-blue-600">Belasting over totaal exclusief BTW</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-800">€{btwBedrag.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Totaal */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">TOTAAL INCLUSIEF BTW</p>
              <p className="text-2xl font-bold mt-1">€{totaalInclBtw.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>

        {/* Notities */}
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p>
            Deze calculatie is een schatting op basis van ingevoerde gegevens.
            Definitieve kosten kunnen afwijken op basis van uitvoeringsdetails.
          </p>
        </div>
      </div>
    </div>
  )
}
