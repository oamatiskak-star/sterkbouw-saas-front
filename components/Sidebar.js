import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { isActiveRoute } from "../lib/isActiveRoute"

export default function Sidebar({ mobileOpen, onClose }) {
  const router = useRouter()
  const [modules, setModules] = useState([])

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    async function load() {
      const { data } = await supabase
        .from("modules")
        .select("*")
        .eq("active", true)
        .order("sort_order")

      setModules(data || [])
    }

    load()
  }, [])

  const roots = modules.filter(m => !m.parent_key)
  const children = modules.filter(m => m.parent_key)

  return (
    <>
      {mobileOpen && <div className="sb-overlay" onClick={onClose} />}

      <aside className={`sb-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sb-logo">SterkBouw</div>

        {roots.map(root => (
          <div key={root.key} className="sb-group">
            <Link
              href={root.route}
              className={`sb-root ${
                isActiveRoute(router.pathname, root.route) ? "active" : ""
              }`}
            >
              {root.label}
            </Link>

            <div className="sb-submenu">
              {children
                .filter(c => c.parent_key === root.key)
                .map(child => (
                  <Link
                    key={child.key}
                    href={child.route}
                    className={`sb-sub ${
                      isActiveRoute(router.pathname, child.route) ? "active" : ""
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </aside>
    </>
  )
}
