"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RisicoanalysePage() {
  const [risicoData, setRisicoData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("risicoanalyse").select("*")
      if (error) {
        console.error("Fout bij ophalen risicoanalyse:", error)
      } else {
        setRisicoData(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Risicoanalyse</h1>

        {loading ? (
          <p>Gegevens worden geladen...</p>
        ) : risicoData.length === 0 ? (
          <p>Geen risico’s gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Categorie</th>
                <th className="text-left p-3">Beschrijving</th>
                <th className="text-left p-3">Impact</th>
              </tr>
            </thead>
            <tbody>
              {risicoData.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-3">{item.categorie}</td>
                  <td className="p-3">{item.beschrijving}</td>
                  <td className="p-3">{item.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
