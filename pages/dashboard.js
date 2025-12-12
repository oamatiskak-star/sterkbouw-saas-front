import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/login")
        return
      }
      setUser(data.session.user)
      setLoading(false)
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p className="text-lg">Dashboard laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-4">Welkom bij SterkBouw, {user.email}</h1>
        <p className="text-gray-700">Je bent nu ingelogd en hebt toegang tot het dashboard.</p>

        {/* Extra modules, tegels of cards kunnen hier toegevoegd worden */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow">Module: Calculatie</div>
          <div className="bg-white p-6 rounded-2xl shadow">Module: Projectbeheer</div>
          <div className="bg-white p-6 rounded-2xl shadow">Module: Risicoanalyse</div>
          <div className="bg-white p-6 rounded-2xl shadow">Module: Notificaties</div>
        </div>
      </div>
    </div>
  )
}
