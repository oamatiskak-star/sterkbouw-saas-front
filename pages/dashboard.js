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

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/login")
        return
      }
      setUser(data.user)

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/modules"
      )
      const json = await res.json()
      if (json.ok) setModules(json.modules)
    }

    init()
  }, [])

  if (!user) {
    return <div className="p-8">Laden...</div>
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          SterkBouw
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {modules.map(m => (
            <a
              key={m.key}
              href={m.path}
              className="block px-4 py-2 rounded hover:bg-yellow-500 hover:text-black transition"
            >
              {m.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 text-sm">
          {user.email}
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map(m => (
            <ModuleCard key={m.key} module={m} />
          ))}
        </div>
      </main>
    </div>
  )
}

function ModuleCard({ module }) {
  return (
    <a
      href={module.path}
      className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col"
    >
      <div className="text-xl font-semibold mb-2">
        {module.label}
      </div>

      <div className="text-gray-600 flex-1">
        {module.description}
      </div>

      <div className="mt-4 text-yellow-600 font-semibold">
        Open module →
      </div>
    </a>
  )
}
