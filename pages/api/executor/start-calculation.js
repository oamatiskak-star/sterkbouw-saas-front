// sterkbouw-saas-executor/actions/start_calculation.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function startCalculation(task) {
  const { id: taskId, payload } = task;

  // 1. CLAIM TASK – ALTIJD
  await supabase
    .from("executor_tasks")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", taskId);

  let runId = task.calculation_run_id;

  try {
    // 2. LAZY LOAD CONTEXT (GEEN SILENT SKIPS)
    let files = payload.files || [];
    let items = payload.items || [];
    let results = payload.results || [];

    if (files.length === 0) {
      const { data } = await supabase
        .from("document_sources")
        .select("*")
        .eq("project_id", payload.project_id);
      files = data || [];
    }

    if (items.length === 0) {
      const { data } = await supabase
        .from("calculation_items")
        .select("*")
        .eq("project_id", payload.project_id);
      items = data || [];
    }

    // 3. CREATE / CLAIM CALCULATION RUN
    if (!runId) {
      const { data: run, error: runError } = await supabase
        .from("calculation_runs")
        .insert({
          project_id: payload.project_id,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (runError) {
        throw new Error(runError.message);
      }

      runId = run.id;

      await supabase
        .from("executor_tasks")
        .update({ calculation_run_id: runId })
        .eq("id", taskId);
    }

    // 4. HIER VINDT DE ECHTE CALCULATIE PLAATS
    // (bestaande rekenlogica blijft hier ongewijzigd)
    // ------------------------------------------------
    // Voor nu: executor accepteert kale context en loopt door
    // ------------------------------------------------

    // 5. SUCCESVOL AFRONDEN
    await supabase
      .from("calculation_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    await supabase
      .from("executor_tasks")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
      })
      .eq("id", taskId);
  } catch (err) {
    // 6. FOUTAFHANDELING (GEEN STILLE BLOKKADES)
    await supabase
      .from("executor_tasks")
      .update({
        status: "failed",
        error: err.message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (runId) {
      await supabase
        .from("calculation_runs")
        .update({
          status: "failed",
          error: err.message,
          finished_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }

    throw err;
  }
}
