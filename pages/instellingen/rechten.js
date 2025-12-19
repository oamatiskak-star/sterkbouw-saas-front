import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  const { data: permissions } = await supabase
    .from("permissions")
    .select("id, key, label, scope")
    .order("scope")
    .order("label")

  return {
    props: {
      permissions: permissions || []
    }
  }
}

export default function RechtenPage({ permissions }) {
  return (
    <div>
      <h1 className="mb-4">Rechten</h1>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Scope</th>
              <th>Label</th>
              <th>Key</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map(p => (
              <tr key={p.id}>
                <td>{p.scope}</td>
                <td>{p.label}</td>
                <td>{p.key}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
