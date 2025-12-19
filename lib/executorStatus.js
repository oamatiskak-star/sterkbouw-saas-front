import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function fetchExecutorStatus({ project_id, limit = 20 } = {}) {
  let query = supabase
    .from("executor_logs")
    .select(`
      id,
      created_at,
      project_id,
      workflow_key,
      status,
      message
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (project_id) {
    query = query.eq("project_id", project_id)
  }

  const { data, error } = await query
  if (error) return []

  return data || []
}
