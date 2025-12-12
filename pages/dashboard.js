import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
      } else {
        setUser(data.session.user)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 text-black p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SterkBouw Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-xl"
        >
          Uitloggen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Calculaties</h2>
          <p>Toegang tot alle STABU calculaties</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Risico-analyse</h2>
          <p>Bekijk projectrisico’s realtime</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Notificaties</h2>
          <p>Laatste meldingen van de AO Agent</p>
        </div>
      </div>
    </div>
  )
}
