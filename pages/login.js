import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="page page-center">
      <div className="container-tight py-4">
        <div className="card card-md">
          <div className="card-body">
            <h2 className="h2 text-center mb-4">Inloggen</h2>

            <form onSubmit={handleLogin} autoComplete="off">
              <div className="mb-3">
                <label className="form-label">E-mailadres</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="naam@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Wachtwoord</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="form-footer">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Bezig..." : "Inloggen"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center text-muted mt-3">
          SterkBouw SaaS
        </div>
      </div>
    </div>
  )
}
