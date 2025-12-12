"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

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
      if (!data?.user || error) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return <p className="p-6">Laden...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welkom op je dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Calculatie" href="/calculatie" />
          <Card title="Risicoanalyse" href="/risicoanalyse" />
          <Card title="Notificaties" href="/notificaties" />
          <Card title="Gebruikersbeheer" href="/admin" />
        </div>
      </div>
    </div>
  )
}

function Card({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block bg-white shadow rounded-2xl p-6 hover:bg-gray-50 transition"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">Bekijk of bewerk {title.toLowerCase()}.</p>
    </a>
  )
}
