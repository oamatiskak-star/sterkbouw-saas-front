import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import { PersonAdd } from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import getSupabase from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = getSupabase()
  const { signInWithPassword } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'field',
    company: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    setLoading(true)

    try {
      // 1️⃣ Supabase account aanmaken
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: form.role,
            company: form.company,
          },
        },
      })

      if (signUpError) throw signUpError

      // 2️⃣ Direct inloggen
      const { error: loginError } = await signInWithPassword(
        form.email,
        form.password
      )

      if (loginError) throw loginError

      // 3️⃣ Naar SaaS dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Registratie mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5">Account aanmaken</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Naam"
              margin="normal"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />

            <TextField
              fullWidth
              required
              label="E-mail"
              type="email"
              margin="normal"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />

            <TextField
              fullWidth
              required
              label="Wachtwoord"
              type="password"
              margin="normal"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />

            <TextField
              fullWidth
              required
              label="Bevestig wachtwoord"
              type="password"
              margin="normal"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />

            <TextField
              fullWidth
              select
              label="Rol"
              margin="normal"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            >
              <MenuItem value="field">Uitvoerder</MenuItem>
              <MenuItem value="admin">Beheerder</MenuItem>
            </TextField>

            <TextField
              fullWidth
              required
              label="Bedrijf"
              margin="normal"
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registreren'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={() => router.push('/auth/login')}>
                Al een account? Inloggen
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}
