"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StabuCalculatorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [regels, setRegels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }

    const fetchRegels = async () => {
      const { data, error } = await supabase
        .from("stabu_calculator")
        .select("*")
        .order("code")

      if (error) {
        console.error("Fout bij ophalen STABU regels:", error)
      } else {
        setRegels(data)
      }
      setLoading(false)
    }

    checkUser()
    fetchRegels()
  }, [])

  if (!user) return <div className="p-6">Laden...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">STABU Calculator</h1>

        {loading ? (
          <p>Gegevens worden geladen...</p>
        ) : regels.length === 0 ? (
          <p>Geen calculatieregels gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Omschrijving</th>
                <th className="text-right p-3">Materiaal</th>
                <th className="text-right p-3">Arbeid</th>
                <th className="text-right p-3">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {regels.map((regel: any) => (
                <tr key={regel.id} className="border-t border-gray-100">
                  <td className="p-3">{regel.code}</td>
                  <td className="p-3">{regel.omschrijving}</td>
                  <td className="p-3 text-right">€ {regel.materiaal?.toFixed(2)}</td>
                  <td className="p-3 text-right">€ {regel.arbeid?.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold">
                    € {(regel.materiaal + regel.arbeid).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
