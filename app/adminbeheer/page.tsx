"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminbeheerPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("gebruikers").select("*")
      if (error) {
        console.error("Fout bij ophalen gebruikers:", error)
        setLoading(false)
        return
      }
      setUsers(data)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adminbeheer</h1>

        {loading ? (
          <p>Gebruikers worden geladen...</p>
        ) : users.length === 0 ? (
          <p>Geen gebruikers gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((gebruiker) => (
                <tr key={gebruiker.id} className="border-t border-gray-100">
                  <td className="p-3">{gebruiker.email}</td>
                  <td className="p-3">{gebruiker.rol || "Onbekend"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
