import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RisicoAnalyse() {
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
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Risicoanalyse</h1>

        <div className="bg-white shadow rounded-2xl p-6">
          <p className="mb-4">
            Deze module toont straks automatisch gegenereerde risicoanalyses op basis van projectdata.
          </p>
          <p className="text-sm text-gray-500">
            Volgende stap: integratie met backend en Excel-import.
          </p>
        </div>
      </div>
    </div>
  )
}
