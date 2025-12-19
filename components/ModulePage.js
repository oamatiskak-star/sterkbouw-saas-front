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
  const [children, setChildren] = useState([])

  useEffect(() => {
    if (!router.pathname) return
    loadModule()
  }, [router.pathname])

  async function loadModule() {
    const { data: mod } = await supabase
      .from("modules")
      .select("key,label,route")
      .eq("route", router.pathname)
      .single()

    if (!mod) {
      setModule(null)
      setChildren([])
      return
    }

    setModule(mod)

    const { data: childs } = await supabase
      .from("modules")
      .select("key,label,route,sort_order")
      .eq("parent_key", mod.key)
      .eq("active", true)
      .order("sort_order", { ascending: true })

    setChildren(childs || [])
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
        {children.map(child => {
          const active = router.pathname === child.route

          return (
            <Link key={child.key} href={child.route}>
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
                  {child.label}
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
