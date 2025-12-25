import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "../lib/supabase"
import { isActiveRoute } from "../lib/isActiveRoute"

export default function Sidebar({ mobileOpen, onClose }) {
  const router = useRouter()
  const [modules, setModules] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("active", true)
        .order("sort_order")

      if (!cancelled && !error) {
        setModules(data || [])
      }
    }

    load()

    return () => {
      cancelled = true
    }
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
                      isActiveRoute(router.pathname, child.route)
                        ? "active"
                        : ""
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
