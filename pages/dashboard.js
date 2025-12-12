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
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [])

  if (!user) return <p>Bezig met laden...</p>

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-yellow-500">SterkBouw Dashboard</h1>
      <p className="text-gray-700 mt-4">Welkom terug, {user.email}</p>

      <div className="grid grid-cols-2 gap-6 mt-10">
        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="text-lg font-semibold">Projecten</h2>
          <p className="text-sm text-gray-500">Beheer alle lopende projecten</p>
        </div>
        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="text-lg font-semibold">Calculaties</h2>
          <p className="text-sm text-gray-500">STABU en Fixed Price modules</p>
        </div>
        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="text-lg font-semibold">Risico Analyse</h2>
          <p className="text-sm text-gray-500">Bekijk risicoprofielen en alerts</p>
        </div>
        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="text-lg font-semibold">Teambeheer</h2>
          <p className="text-sm text-gray-500">Voeg nieuwe gebruikers toe</p>
        </div>
      </div>
    </div>
  )
}
