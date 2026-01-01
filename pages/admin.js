import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminBeheer() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('gebruikers')
        .select('*')

      if (error) {
        console.error('Fout bij ophalen gebruikers:', error)
        setLoading(false)
        return
      }

      setUsers(data || [])
      setLoading(false)
    }

    fetchUsers()
  }, [])

  return (
    <div className="container-xl">
      <div className="page-header mb-4">
        <h2 className="page-title">Adminbeheer</h2>
      </div>

      <div className="card">
        <div className="card-body">
          {loading && (
            <div className="text-muted">Gebruikers worden geladen…</div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-muted">Geen gebruikers gevonden.</div>
          )}

          {!loading && users.length > 0 && (
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((gebruiker) => (
                    <tr key={gebruiker.id}>
                      <td>{gebruiker.email}</td>
                      <td>
                        <span className="badge bg-blue-lt">
                          {gebruiker.rol || 'Onbekend'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
