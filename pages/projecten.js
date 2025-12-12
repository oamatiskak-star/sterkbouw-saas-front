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
    const fetchProjecten = async () => {
      const { data, error } = await supabase.from("projecten").select("*").order("startdatum", { ascending: false })
      if (error) {
        console.error("Fout bij ophalen projecten:", error)
        setLoading(false)
        return
      }
      setProjecten(data)
      setLoading(false)
    }

    fetchProjecten()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Projecten</h1>

        {loading ? (
          <p>Projecten worden geladen...</p>
        ) : projecten.length === 0 ? (
          <p>Geen projecten gevonden.</p>
        ) : (
          <ul className="space-y-4">
            {projecten.map((project) => (
              <li key={project.id} className="bg-white rounded-2xl shadow p-4 border border-gray-200">
                <div className="font-semibold text-lg">{project.naam}</div>
                <div className="text-sm text-gray-600">{project.locatie}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Start: {new Date(project.startdatum).toLocaleDateString()} — Status: {project.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
