import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  // 1. Haal page_buttons op
  const { data: pageButtons, error: pbError } = await supabase
    .from("page_buttons")
    .select("button_action, sort_order")
    .eq("page_slug", "dashboard")
    .order("sort_order", { ascending: true })

  if (pbError || !pageButtons || pageButtons.length === 0) {
    return { props: { buttons: [] } }
  }

  // 2. Haal bijbehorende ui_buttons op via action_key
  const actionKeys = pageButtons.map(b => b.button_action)

  const { data: uiButtons, error: ubError } = await supabase
    .from("ui_buttons")
    .select("action_key, label, icon")
    .in("action_key", actionKeys)

  if (ubError || !uiButtons) {
    return { props: { buttons: [] } }
  }

  // 3. Merge + sort
  const buttons = pageButtons.map(pb => {
    const ui = uiButtons.find(
      ub => ub.action_key === pb.button_action
    )

    if (!ui) return null

    return {
      action_key: ui.action_key,
      label: ui.label,
      icon: ui.icon
    }
  }).filter(Boolean)

  return {
    props: { buttons }
  }
}

export default function DashboardPage({ buttons }) {
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      <div className="row mb-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {buttons.map(btn => (
          <a
            key={btn.action_key}
            href={`/${btn.action_key.replace("project_", "")}`}
            className="btn btn-primary"
          >
            <i className={`ti ti-${btn.icon} me-2`} />
            {btn.label}
          </a>
        ))}
      </div>
    </div>
  )
}
