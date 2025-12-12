import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  if (!user) {
    return <div className="p-6 text-gray-700">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welkom, {user.email}</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DashboardTile title="📊 Calculaties" link="/calculator" />
          <DashboardTile title="🏗️ Projecten" link="/projecten" />
          <DashboardTile title="🧱 BIM Architectuur" link="/bim" />
          <DashboardTile title="🛠️ Risico Analyse" link="/risico" />
          <DashboardTile title="📣 Notificaties" link="/notificaties" />
          <DashboardTile title="👥 Teambeheer" link="/team" />
        </div>
      </div>
    </div>
  )
}

function DashboardTile({ title, link }) {
  return (
    <a
      href={link}
      className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
    >
      <div className="text-lg font-semibold">{title}</div>
    </a>
  )
}
