import { useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.replace("/dashboard")
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-xl p-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <p className="text-gray-600 mb-6">
        Log in om toegang te krijgen tot jouw projecten, calculaties en dashboards.
      </p>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium mb-1">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="voorbeeld@sterkbouw.nl"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Inloggen..." : "Inloggen"}
        </button>
      </form>
    </div>
  )
}
