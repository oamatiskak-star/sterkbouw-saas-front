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
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/modules"
        )
        const json = await res.json()

        if (json.ok && Array.isArray(json.modules)) {
          setModules(json.modules)
        }
      } catch (e) {
        console.error("Modules ophalen mislukt", e)
      }

      setLoading(false)
    }

    init()
  }, [])

  if (!user || loading) {
    return <div className="p-6 text-gray-700">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Welkom, {user.email}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((module) => (
            <a
              key={module.key}
              href={module.path}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">
                {module.label}
              </div>
              {module.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {module.description}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
 
