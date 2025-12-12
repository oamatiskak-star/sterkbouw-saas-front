'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return <div className="p-6 text-gray-600">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welkom, {user?.email}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Calculatie" link="/calculatie" />
          <Card title="Risicoanalyse" link="/risico" />
          <Card title="Adminbeheer" link="/admin" />
          <Card title="Notificaties" link="/notificaties" />
        </div>
      </div>
    </div>
  )
}

function Card({ title, link }: { title: string; link: string }) {
  return (
    <a
      href={link}
      className="block bg-white p-6 rounded-2xl shadow hover:shadow-md transition border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </a>
  )
}
