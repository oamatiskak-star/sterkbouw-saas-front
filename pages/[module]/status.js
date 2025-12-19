import WorkflowStatus from "../../components/WorkflowStatus"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getServerSideProps({ params }) {
  const { module } = params

  const { data, error } = await supabase
    .from("workflow_status")
    .select("*")
    .eq("module_key", module)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return { props: { status: null } }
  }

  return {
    props: {
      status: data
    }
  }
}

export default function ModuleStatusPage({ status }) {
  return (
    <div>
      <h1 className="mb-4">Workflow status</h1>
      <WorkflowStatus status={status} />
    </div>
  )
}
