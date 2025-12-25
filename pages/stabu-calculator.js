import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function StabuCalculator() {
  const [regels, setRegels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("stabu_calculator")
        .select("*")

      if (cancelled) return

      if (error) {
        console.error("Fout bij ophalen STABU regels:", error)
        setLoading(false)
        return
      }

      setRegels(data || [])
      setLoading(false)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">STABU Calculator</h1>

        {loading ? (
          <p>Gegevens worden geladen...</p>
        ) : regels.length === 0 ? (
          <p>Geen regels gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Categorie</th>
                <th className="text-left p-3">Omschrijving</th>
                <th className="text-left p-3">Prijs</th>
              </tr>
            </thead>
            <tbody>
              {regels.map(regel => (
                <tr key={regel.id} className="border-t border-gray-100">
                  <td className="p-3">{regel.categorie}</td>
                  <td className="p-3">{regel.omschrijving}</td>
                  <td className="p-3">€ {regel.prijs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
