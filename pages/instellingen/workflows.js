import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps() {
  const { data: workflows } = await supabase
    .from("workflows")
    .select("id, key, label, module, description")
    .order("module")
    .order("label")

  return {
    props: {
      workflows: workflows || []
    }
  }
}

export default function WorkflowsPage({ workflows }) {
  return (
    <div>
      <h1 className="mb-4">Workflows</h1>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Module</th>
              <th>Workflow</th>
              <th>Key</th>
              <th>Beschrijving</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map(wf => (
              <tr key={wf.id}>
                <td>{wf.module}</td>
                <td>{wf.label}</td>
                <td>{wf.key}</td>
                <td>{wf.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
