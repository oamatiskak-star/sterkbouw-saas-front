import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function fetchAuditLogs({
  project_id,
  user_id,
  workflow_key,
  limit = 100
} = {}) {
  let query = supabase
    .from("audit_logs")
    .select(`
      id,
      created_at,
      user_id,
      project_id,
      workflow_key,
      action,
      meta,
      users:users(email)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (project_id) query = query.eq("project_id", project_id)
  if (user_id) query = query.eq("user_id", user_id)
  if (workflow_key) query = query.eq("workflow_key", workflow_key)

  const { data, error } = await query
  if (error) return []

  return (data || []).map(row => ({
    id: row.id,
    created_at: row.created_at,
    user_id: row.user_id,
    user_email: row.users?.email || null,
    project_id: row.project_id,
    workflow_key: row.workflow_key,
    action: row.action,
    meta: row.meta
  }))
}
