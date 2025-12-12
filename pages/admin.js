import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminPanel() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/login")
        return
      }

      const email = data.user.email
      setUser(data.user)

      if (email === "o.amatiskak@sterkbouw.nl") {
        setIsAdmin(true)
      } else {
        router.push("/dashboard")
      }
    }

    checkAdmin()
  }, [])

  if (!user) {
    return <div className="p-6 text-gray-700">Bezig met laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adminpaneel</h1>

        {!isAdmin && (
          <p className="text-red-500">Geen toegang tot deze pagina.</p>
        )}

        {isAdmin && (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-2xl p-4">
              <p className="font-semibold">Toekomstige functies hier zichtbaar</p>
              <p className="text-sm text-gray-600">
                Zoals gebruikersbeheer, systeemstatus en AO Agent instellingen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
