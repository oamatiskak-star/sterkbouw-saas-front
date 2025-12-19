import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Sidebar() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    loadMenu()
  }, [])

  async function loadMenu() {
    const { data, error } = await supabase
      .from("modules")
      .select("key,label,icon,route,sort_order")
      .eq("active", true)
      .not("route", "is", null)
      .order("sort_order", { ascending: true })

    if (!error) {
      const filtered = (data || []).filter(m => m.route && m.route.startsWith("/"))
      setModules(filtered)
    }
  }

  return (
    <aside style={{ width: 260, padding: 16, borderRight: "1px solid #eee" }}>
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Admin Main</div>

      {modules.map(m => (
        <Link key={m.key} href={m.route}>
          <div
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: 6
            }}
          >
            {m.label}
          </div>
        </Link>
      ))}
    </aside>
  )
}
