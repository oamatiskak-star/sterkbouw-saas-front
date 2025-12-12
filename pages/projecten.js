import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Projecten() {
  const [projecten, setProjecten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("projecten").select("*")
      if (error) {
        console.error("Fout bij ophalen projecten:", error)
        setLoading(false)
        return
      }
      setProjecten(data)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Projectenoverzicht</h1>

        {loading ? (
          <p>Projecten worden geladen...</p>
        ) : projecten.length === 0 ? (
          <p>Geen projecten gevonden.</p>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3">Naam</th>
                <th className="text-left p-3">Locatie</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {projecten.map((project) => (
                <tr key={project.id} className="border-t border-gray-100">
                  <td className="p-3">{project.naam}</td>
                  <td className="p-3">{project.locatie}</td>
                  <td className="p-3">{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
