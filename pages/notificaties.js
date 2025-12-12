import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Notificaties() {
  const [berichten, setBerichten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotificaties = async () => {
      const { data, error } = await supabase.from("notificaties").select("*").order("created_at", { ascending: false })
      if (error) {
        console.error("Fout bij ophalen notificaties:", error)
        setLoading(false)
        return
      }
      setBerichten(data)
      setLoading(false)
    }

    fetchNotificaties()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notificaties</h1>

        {loading ? (
          <p>Notificaties worden geladen...</p>
        ) : berichten.length === 0 ? (
          <p>Geen notificaties gevonden.</p>
        ) : (
          <ul className="space-y-4">
            {berichten.map((bericht) => (
              <li key={bericht.id} className="bg-white p-4 rounded-2xl shadow border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">{new Date(bericht.created_at).toLocaleString()}</p>
                <p>{bericht.tekst}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
