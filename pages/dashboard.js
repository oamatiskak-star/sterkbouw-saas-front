import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { NAVIGATION } from "../config/navigation"
import DashboardKpis from "../components/DashboardKpis"
import { getDashboardKpis } from "../lib/kpi"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  const kpis = await getDashboardKpis()

  const { data: pageButtons } = await supabase
    .from("page_buttons")
    .select("button_action, sort_order")
    .eq("page_slug", "dashboard")
    .order("sort_order")

  const actionKeys = (pageButtons || []).map(b => b.button_action)

  const { data: uiButtons } = await supabase
    .from("ui_buttons")
    .select("action_key, label, icon")
    .in("action_key", actionKeys)

  const buttons = (pageButtons || []).map(pb => {
    const ui = (uiButtons || []).find(u => u.action_key === pb.button_action)
    if (!ui) return null
    return {
      action_key: ui.action_key,
      label: ui.label,
      icon: ui.icon
    }
  }).filter(Boolean)

  return {
    props: { buttons, kpis }
  }
}

export default function DashboardPage({ buttons, kpis }) {
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      <DashboardKpis kpis={kpis} />

      <div className="d-flex flex-wrap gap-3">
        {NAVIGATION.map(menu => {
          const btn = buttons.find(b => b.action_key === menu.key)
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
