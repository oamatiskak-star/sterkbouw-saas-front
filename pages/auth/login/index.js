import { useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../../../lib/supabase'
import TablerAuthLayout from '../../../components/TablerAuthLayout'

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

    router.replace('/dashboard')
  }

  return (
    <TablerAuthLayout>
      <form onSubmit={handleLogin} autoComplete="off">
        <div className="mb-3">
          <label className="form-label">E-mail</label>
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
          <div className="alert alert-danger mb-3">{error}</div>
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
    </TablerAuthLayout>
  )
}
