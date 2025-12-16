import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function TablerNav() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("app_modules")
        .select("label, route, icon")
        .eq("active", true)
        .order("position", { ascending: true })

      setModules(data || [])
    }

    load()
  }, [])

  return (
    <div className="navbar-nav">
      {modules.map((m) => (
        <Link key={m.route} href={m.route} className="nav-link">
          {m.icon && <span className="nav-link-icon">{m.icon}</span>}
          <span className="nav-link-title">{m.label}</span>
        </Link>
      ))}
    </div>
  )
}
