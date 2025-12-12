import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Login mislukt: " + error.message)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Inloggen</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white font-semibold p-3 rounded-lg hover:bg-yellow-600"
        >
          Login
        </button>
      </form>
    </div>
  )
}


// SAAS_FRONT/pages/dashboard.js
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

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
        <h1 className="text-2xl font-bold mb-6">Welkom terug, {user.email}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
            <h2 className="font-semibold text-lg">STABU Calculatie</h2>
            <p className="text-gray-600 text-sm">Bekijk en optimaliseer jouw calculaties.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
            <h2 className="font-semibold text-lg">Risicoanalyse</h2>
            <p className="text-gray-600 text-sm">Bekijk projectrisico’s en impact.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
            <h2 className="font-semibold text-lg">Adminbeheer</h2>
            <p className="text-gray-600 text-sm">Gebruikers en rollen beheren.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
            <h2 className="font-semibold text-lg">Notificaties</h2>
            <p className="text-gray-600 text-sm">Bekijk recente systeemmeldingen.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
