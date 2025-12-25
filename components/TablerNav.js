import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function TablerNav() {
  const [items, setItems] = useState([])

  useEffect(() => {
    loadNav()
  }, [])

  async function loadNav() {
    const { data, error } = await supabase
      .from("ui_navigation")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (!error && data) {
      setItems(data)
    }
  }

  return (
    <aside className="navbar navbar-vertical navbar-expand-lg">
      <div className="container-fluid">
        <h1 className="navbar-brand navbar-brand-autodark">
          SterkBouw SaaS
        </h1>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav pt-lg-3">
            {items.map(item => (
              <li className="nav-item" key={item.id}>
                <Link href={item.route} className="nav-link">
                  <span className="nav-link-icon">
                    <i className={`ti ti-${item.icon || "circle"}`}></i>
                  </span>
                  <span className="nav-link-title">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
