import { useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabase'

export default function LoginPage() {
  const supabase = getSupabase()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Inloggen mislukt')
      setLoading(false)
      return
    }

    // Na inloggen naar de SterkCalc-omgeving (primaire entrypoint), niet de oude admin.
    router.replace('/calculaties')
  }

  return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <h1 className="h2">Inloggen</h1>
          <p className="text-muted">SterkBouw Platform</p>
        </div>

        <div className="card card-md">
          <div className="card-body">
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
                  {loading ? 'Bezig…' : 'Inloggen'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center text-muted mt-3">
          Geen account? Neem contact op met de beheerder.
        </div>
      </div>
    </div>
  )
}
