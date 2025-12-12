"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NotificatiesPage() {
  const [berichten, setBerichten] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBerichten = async () => {
      const { data, error } = await supabase
        .from("notificaties")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Fout bij ophalen notificaties:", error)
        setLoading(false)
        return
      }
      setBerichten(data)
      setLoading(false)
    }

    fetchBerichten()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notificaties</h1>

        {loading ? (
          <p>Notificaties worden geladen...</p>
        ) : berichten.length === 0 ? (
          <p>Geen notificaties gevonden.</p>
        ) : (
          <ul className="space-y-4">
            {berichten.map((item) => (
              <li key={item.id} className="bg-white rounded-2xl shadow p-4 border border-gray-200">
                <div className="font-semibold">{item.titel}</div>
                <div className="text-sm text-gray-600">{item.bericht}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
