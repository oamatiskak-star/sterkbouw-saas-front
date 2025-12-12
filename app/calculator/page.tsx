"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CalculatorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!data?.user || error) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading || !user) {
    return <div className="p-6 text-gray-700">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">STABU Calculatie</h1>

        <div className="bg-white shadow rounded-2xl p-6">
          <p className="mb-4">
            Hier komt de STABU calculatietool met inputvelden, tabellen en prijsberekeningen.
          </p>
          <p className="text-sm text-gray-500">
            Volgende stap: data ophalen uit Supabase en koppeling met STABU-bestanden.
          </p>
        </div>
      </div>
    </div>
  )
}
