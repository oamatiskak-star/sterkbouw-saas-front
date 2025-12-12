"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RisicoanalysePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [risicoData, setRisicoData] = useState([])
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

    const fetchData = async () => {
      const { data, error } = await supabase.from("risicoanalyse").select("*")
      if (!error && data) {
        setRisicoData(data)
      }
      setLoading(false)
    }

    checkUser()
    fetchData()
  }, [])

  if (!user) return <div className="p-6">Laden...</div>

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
              {risicoData.map((item: any) => (
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
