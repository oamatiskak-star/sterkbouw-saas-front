import { useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "../lib/supabase"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [error, setError] = useState("")
  const [melding, setMelding] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setMelding("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord
    })

    setLoading(false)

    if (error) {
      setError("Inloggen mislukt: " + error.message)
    } else {
      router.push("/dashboard/projects")
    }
  }

  const wachtwoordReset = async () => {
    setError("")
    setMelding("")

    if (!email) {
      setError("Vul je e-mailadres in om je wachtwoord te herstellen.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        process.env.NEXT_PUBLIC_SUPABASE_RESET_REDIRECT_URL ||
        "https://app.sterkbouw.nl/reset"
    })

    if (error) {
      setError("Fout bij versturen resetlink: " + error.message)
    } else {
      setMelding("Resetlink is verstuurd naar je e-mail.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          SterkBouw Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="wachtwoord"
              className="block text-sm font-medium mb-1"
            >
              Wachtwoord
            </label>
            <input
              id="wachtwoord"
              type="password"
              autoComplete="current-password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {melding && (
            <div className="text-green-600 text-sm text-center">
              {melding}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition"
          >
            {loading ? "Bezig met inloggen…" : "Inloggen"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={wachtwoordReset}
              className="text-sm text-blue-600 hover:underline"
            >
              Wachtwoord vergeten?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
