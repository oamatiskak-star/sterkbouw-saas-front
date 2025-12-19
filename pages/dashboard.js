import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { NAVIGATION } from "../config/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  // Haal dashboard buttons op
  const { data: pageButtons, error: pbError } = await supabase
    .from("page_buttons")
    .select("button_action, sort_order")
    .eq("page_slug", "dashboard")
    .order("sort_order", { ascending: true })

  if (pbError || !pageButtons || pageButtons.length === 0) {
    return { props: { buttons: [] } }
  }

  const actionKeys = pageButtons.map(b => b.button_action)

  const { data: uiButtons, error: ubError } = await supabase
    .from("ui_buttons")
    .select("action_key, label, icon")
    .in("action_key", actionKeys)

  if (ubError || !uiButtons) {
    return { props: { buttons: [] } }
  }

  const buttons = pageButtons
    .map(pb => {
      const ui = uiButtons.find(
        ub => ub.action_key === pb.button_action
      )
      if (!ui) return null
      return {
        action_key: ui.action_key,
        label: ui.label,
        icon: ui.icon
      }
    })
    .filter(Boolean)

  return {
    props: { buttons }
  }
}

export default function DashboardPage({ buttons }) {
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      {/* KPI BLOK – bewust leeg, live inject later */}
      <div className="row mb-4">
        <div className="col"><div className="card"><div className="card-body">KPI</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI</div></div></div>
      </div>

      {/* 11 HOOFDMENU KNOPPEN – DATA GEDREVEN */}
      <div className="d-flex flex-wrap gap-3">
        {NAVIGATION.map(menu => {
          const btn = buttons.find(
            b => b.action_key === menu.key
          )

          if (!btn) return null

          return (
            <Link
              key={menu.key}
              href={menu.route}
              className="btn btn-primary"
            >
              <i className={`ti ti-${btn.icon} me-2`} />
              {btn.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

