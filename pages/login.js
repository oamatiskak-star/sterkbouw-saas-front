import { useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/lib/supabase"

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message || "Inloggen mislukt")
      setLoading(false)
      return
    }

    // Succes → dashboard
    router.replace("/dashboard")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 420,
          padding: 32,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <h1 style={{ marginBottom: 24 }}>Inloggen</h1>

        <div style={{ marginBottom: 16 }}>
          <label>E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginTop: 4
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginTop: 4
            }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#f2c200",
            color: "#000",
            border: "none",
            fontWeight: "bold",
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "Bezig…" : "Inloggen"}
        </button>
      </form>
    </div>
  )
}
