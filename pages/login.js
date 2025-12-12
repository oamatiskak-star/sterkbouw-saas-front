import { useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [foutmelding, setFoutmelding] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    })
    if (error) {
      setFoutmelding("Inloggen mislukt. Controleer je gegevens.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        {/* Logo bovenaan */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-sterkbouw.svg" // Zet hier jouw juiste logopad
            alt="SterkBouw Logo"
            className="h-16"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Inloggen</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="jouw@voorbeeld.nl"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Wachtwoord</label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="••••••••••"
              required
            />
          </div>
          {foutmelding && <p className="text-red-600 text-sm">{foutmelding}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-lg transition"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  )
}
