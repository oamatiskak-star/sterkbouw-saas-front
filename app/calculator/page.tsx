'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CalculatorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }

    checkUser()
  }, [router])

  if (!user) {
    return <div className="p-6 text-gray-700">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Calculatie</h1>

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
