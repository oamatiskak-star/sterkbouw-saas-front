import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "../lib/supabase"

export default function ModulePage() {
  const router = useRouter()
  const [title, setTitle] = useState("Projecten")
  const [buttons, setButtons] = useState([])

  useEffect(() => {
    if (!router.pathname) return

    let cancelled = false

    async function load() {
      const { data: current } = await supabase
        .from("modules")
        .select("label")
        .eq("route", router.pathname)
        .single()

      if (!cancelled) {
        setTitle(current?.label || "Projecten")
      }

      const { data } = await supabase
        .from("modules")
        .select("key,label,route,sort_order")
        .like("route", "/projecten/%")
        .eq("active", true)
        .order("sort_order", { ascending: true })

      if (!cancelled) {
        setButtons(data || [])
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [router.pathname])

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        {title}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {buttons.map(b => {
          const active = router.pathname === b.route

          return (
            <Link key={b.key} href={b.route}>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                  cursor: "pointer",
                  background: active ? "#f9fafb" : "#fff"
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {b.label}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Open
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
