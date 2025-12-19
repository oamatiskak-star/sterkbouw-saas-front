import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ModulePage() {
  const router = useRouter()
  const [module, setModule] = useState(null)
  const [buttons, setButtons] = useState([])

  useEffect(() => {
    if (!router.pathname) return
    load()
  }, [router.pathname])

  async function load() {
    const baseRoute =
      router.pathname === "/projecten"
        ? "/projecten"
        : router.pathname.split("/").slice(0, 2).join("/")

    const { data: mod } = await supabase
      .from("modules")
      .select("key,label,route")
      .eq("route", baseRoute)
      .single()

    setModule(mod || { label: "Projecten" })

    const { data: items } = await supabase
      .from("modules")
      .select("key,label,route,sort_order")
      .like("route", `${baseRoute}/%`)
      .eq("active", true)
      .order("sort_order", { ascending: true })

    setButtons(items || [])
  }

  if (!module) return null

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        {module.label}
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
