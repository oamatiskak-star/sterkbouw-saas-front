import WorkflowStatus from "../../components/WorkflowStatus"
import { createClient } from "@supabase/supabase-js"

export async function getServerSideProps({ params }) {
  const { module } = params

  // simpele whitelist
  const ALLOWED_MODULES = [
    "analysis",
    "calculatie",
    "pdf",
    "inkoop",
    "planning"
  ]

  if (!ALLOWED_MODULES.includes(module)) {
    return { notFound: true }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from("workflow_status")
    .select("*")
    .eq("module_key", module)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return {
      props: {
        status: null,
        module
      }
    }
  }

  return {
    props: {
      status: data[0],
      module
    }
  }
}

export default function ModuleStatusPage({ status, module }) {
  return (
    <div>
      <h1>Workflow status – {module}</h1>
      <WorkflowStatus status={status} />
    </div>
  )
}
