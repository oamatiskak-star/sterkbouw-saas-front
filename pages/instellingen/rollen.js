import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("roles")
    .select("id, key, label, description")
    .order("label")

  return {
    props: {
      roles: error ? [] : data || []
    }
  }
}

export default function RollenPage({ roles }) {
  return (
    <div>
      <h1 className="mb-4">Rollen</h1>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Key</th>
              <th>Beschrijving</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.label}</td>
                <td>{role.key}</td>
                <td>{role.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
