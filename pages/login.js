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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError("Inloggen mislukt")
      setLoading(false)
      return
    }

    // SUCCES → naar dashboard
    router.replace("/dashboard")
  }

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1 className="mb-4">Inloggen</h1>

      <div className="mb-3">
        <label>E-mailadres</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Wachtwoord</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  )
}
