import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Adminbeheer() {
  const [gebruikers, setGebruikers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGebruikers = async () => {
      const { data, error } = await supabase.from("gebruikers").select("*")
      if (error) console.error("Fout bij ophalen gebruikers:", error)
      setGebruikers(data || [])
      setLoading(false)
    }
    fetchGebruikers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adminbeheer</h1>

        {loading ? (
          <p>Gebruikers worden geladen...</p>
        ) : gebruikers.length === 0 ? (
          <p>Geen gebruikers gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {gebruikers.map((g) => (
                <tr key={g.id} className="border-t border-gray-100">
                  <td className="p-3">{g.email}</td>
                  <td className="p-3">{g.rol || "Onbekend"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


// Bestand: SAAS_FRONT/pages/calculator.js
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Calculator() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) router.push("/login")
      else setUser(data.user)
    }
    checkUser()
  }, [])

  if (!user) return <div className="p-6 text-gray-700">Laden...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">STABU Calculatie</h1>

        <div className="bg-white shadow rounded-2xl p-6">
          <p className="mb-4">
            Hier komt jouw STABU calculatie tool met inputvelden en uitkomsten.
          </p>
          <p className="text-sm text-gray-500">
            Volgende stap: koppeling met backend en STABU-prijslijsten.
          </p>
        </div>
      </div>
    </div>
  )
}
