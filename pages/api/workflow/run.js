import { canRunWorkflow } from "../../../lib/workflowPermissions";
import { logAudit } from "../../../lib/audit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (_) {
    return res.status(400).json({ error: "INVALID_JSON" });
  }

  const { workflow_key, project_id } = body;
  const userId = req.session?.user?.id || null;

  if (!workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" });
  }

  if (userId) {
    const allowed = await canRunWorkflow(userId, workflow_key);
    if (!allowed) {
      return res.status(403).json({ error: "NOT_ALLOWED" });
    }
  }

  await logAudit({
    user_id: userId,
    project_id,
    workflow_key,
    action: "workflow_run"
  });

  if (workflow_key === "analysis") {
    // Zet projectstatus op analyse bezig
    await supabase
      .from("projects")
      .update({
        analysis_status: "running",
        updated_at: new Date().toISOString()
      })
      .eq("id", project_id);

    // Maak executor taak aan
    await supabase
      .from("executor_tasks")
      .insert({
        project_id,
        task_type: "analysis",
        status: "open",
        payload: {
          project_id
        }
      });
  }

  return res.status(200).json({
    ok: true,
    workflow_key,
    project_id
  });
}
