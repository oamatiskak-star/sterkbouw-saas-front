import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  const { data: buttons, error } = await supabase
    .from("page_buttons")
    .select(`
      sort_order,
      ui_buttons (
        action_key,
        label,
        icon
      )
    `)
    .eq("page_slug", "projecten")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error(error)
    return { props: { buttons: [] } }
  }

  return {
    props: {
      buttons: buttons.map(b => ({
        action_key: b.ui_buttons.action_key,
        label: b.ui_buttons.label,
        icon: b.ui_buttons.icon
      }))
    }
  }
}

export default function ProjectenPage({ buttons }) {
  return (
    <div>
      <h1 className="mb-4">Projecten</h1>

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
            href={`/projecten/${btn.action_key.replace("project_", "")}`}
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
