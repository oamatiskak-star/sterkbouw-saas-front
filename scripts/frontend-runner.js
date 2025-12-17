import express from "express"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const app = express()
const PORT = process.env.FRONTEND_PORT || 3000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ROOT = process.cwd()

console.log("FRONTEND RUNNER LIVE")
console.log("ROOT:", ROOT)

async function pollTasks() {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, type, payload")
    .eq("status", "open")
    .eq("assigned_to", "frontend")
    .order("created_at", { ascending: true })
    .limit(1)

  if (error || !tasks || tasks.length === 0) return

  const task = tasks[0]
  console.log("FRONTEND TASK:", task.type)

  await supabase.from("tasks")
    .update({ status: "running" })
    .eq("id", task.id)

  try {
    if (task.type === "frontend:write_file") {
      const { file_path, content } = task.payload
      const fullPath = path.join(ROOT, file_path)

      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, content, "utf8")
    }

    await supabase.from("tasks")
      .update({ status: "done" })
      .eq("id", task.id)

  } catch (e) {
    await supabase.from("tasks")
      .update({ status: "failed", error: e.message })
      .eq("id", task.id)
  }
}

setInterval(pollTasks, 2000)

app.get("/", (_, res) => {
  res.send("Frontend runner alive")
})

app.listen(PORT, () => {
  console.log("Frontend listening on", PORT)
})
