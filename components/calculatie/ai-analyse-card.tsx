// components/calculatie/ai-analyse-card.tsx
import { AlertCircle, CheckCircle, TrendingUp, Shield } from "lucide-react"

interface AIAnalyseResult {
  oppervlakte_m2: number
  bouwjaar: number
  project_type: string
  confidence_score: number
  materiaal_suggesties: Array<{naam: string, eenheid: string, geschatte_kosten: number}>
  risico_indicatoren: string[]
  verduurzamingspotentieel: string[]
}

interface AIAnalyseCardProps {
  resultaat: AIAnalyseResult
}

export function AIAnalyseCard({ resultaat }: AIAnalyseCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Analyse Resultaten</h3>
            <p className="text-sm text-gray-600">Automatische detectie uit documenten</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${resultaat.confidence_score > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {resultaat.confidence_score}% betrouwbaar
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500 mb-1">Oppervlakte</p>
          <p className="text-xl font-semibold">{resultaat.oppervlakte_m2} m²</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500 mb-1">Bouwjaar</p>
          <p className="text-xl font-semibold">{resultaat.bouwjaar}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500 mb-1">Type</p>
          <p className="text-xl font-semibold capitalize">{resultaat.project_type}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500 mb-1">AI Score</p>
          <p className="text-xl font-semibold">{resultaat.confidence_score}/100</p>
        </div>
      </div>

      {/* Materiaal suggesties */}
      {resultaat.materiaal_suggesties.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            AI Materiaal Suggesties
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {resultaat.materiaal_suggesties.slice(0, 3).map((s, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border text-sm">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{s.naam}</span>
                  <span className="text-blue-600">€{s.geschatte_kosten.toFixed(2)}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">{s.eenheid}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risico indicatoren */}
      {resultaat.risico_indicatoren.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-yellow-500" />
            Risico Indicatoren
          </h4>
          <div className="space-y-2">
            {resultaat.risico_indicatoren.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
