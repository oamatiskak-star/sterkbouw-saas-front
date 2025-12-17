import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/router"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    e.stopPropagation()

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

    router.replace("/dashboard")
  }

  return (
    <form
      onSubmit={handleLogin}
      action="#"
      method="post"
    >
      <div className="mb-3">
        <label className="form-label">E-mailadres</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Wachtwoord</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? "Inloggen..." : "Inloggen"}
      </button>
    </form>
  )
}
