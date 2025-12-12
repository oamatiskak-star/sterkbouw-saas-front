'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        setLoading(false)
      }
    }

    getSession()
  }, [router, supabase])

  if (loading) return <p>Bezig met laden...</p>

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welkom terug, {session?.user.email}</p>
      <p className="mt-4">Je bent succesvol ingelogd op het SterkBouw dashboard.</p>
    </main>
  )
}
