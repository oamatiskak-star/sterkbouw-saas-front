import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Notificaties() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [berichten, setBerichten] = useState([])

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
        fetchNotificaties()
      }
    }

    const fetchNotificaties = async () => {
      const { data, error } = await supabase
        .from("notificaties")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error) {
        setBerichten(data)
      }
    }

    checkUser()
  }, [])

  if (!user) {
    return <div className="p-6 text-gray-700">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notificaties</h1>

        <div className="space-y-4">
          {berichten.length === 0 && (
            <p className="text-gray-500">Geen meldingen op dit moment.</p>
          )}

          {berichten.map((n, index) => (
            <div key={index} className="bg-white shadow rounded-2xl p-4">
              <p className="font-semibold">{n.titel || "Bericht"}</p>
              <p className="text-sm text-gray-600">{n.beschrijving}</p>
              <p className="text-xs text-gray-400 mt-2">{n.created_at}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
