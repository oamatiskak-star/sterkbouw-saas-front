import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DashboardPage() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("modules")
      .select("key,label,route,icon,sort_order")
      .eq("active", true)
      .not("route", "like", "/projecten/%")
      .order("sort_order", { ascending: true })

    setModules(data || [])
  }

  return (
    <>
      <h1 className="mb-4">Dashboard</h1>

      <div className="row row-cards mb-4">
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="h3">0</div>
              <div className="text-muted">Actieve projecten</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="h3">€ 0</div>
              <div className="text-muted">Openstaand</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="h3">0</div>
              <div className="text-muted">Taken vandaag</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cards">
        {modules.map(m => (
          <div key={m.key} className="col-md-3">
            <Link href={m.route}>
              <a className="card card-link">
                <div className="card-body">
                  <div className="h3">{m.label}</div>
                  <div className="text-muted">Open module</div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
