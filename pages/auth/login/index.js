import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import TablerAuthLayout from '@/components/TablerAuthLayout'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signInWithPassword(email, password)
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Inloggen mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TablerAuthLayout>
      <div className="card card-md">
        <div className="card-body">
          <h2 className="h2 text-center mb-4">Inloggen</h2>

          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Wachtwoord</label>
              <input
                type="password"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

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

        <div className="card-footer text-center">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => router.push('/auth/register')}
          >
            Nog geen account? Registreren
          </button>
        </div>
      </div>
    </TablerAuthLayout>
  )
}
