import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FRONTEND_ROOT = process.cwd()

async function runFrontendTask(task) {
  const action = task.type

  if (action === "frontend:apply_tabler_layout") {
    applyTablerLayout()
  }

  if (action === "frontend:update_dashboard") {
    updateDashboard(task.payload)
  }
}

function applyTablerLayout() {
  const stylesDir = path.join(FRONTEND_ROOT, "styles")
  fs.mkdirSync(stylesDir, { recursive: true })

  fs.writeFileSync(
    path.join(stylesDir, "globals.css"),
    `
@import "@tabler/core/dist/css/tabler.min.css";

body {
  background-color: #f5f7fb;
}
`.trim()
  )

  const componentsDir = path.join(FRONTEND_ROOT, "components")
  fs.mkdirSync(componentsDir, { recursive: true })

  fs.writeFileSync(
    path.join(componentsDir, "Layout.js"),
    `
export default function Layout({ children }) {
  return (
    <div className="page">
      <aside className="navbar navbar-vertical">
        <div className="navbar-brand">Admin Main</div>
      </aside>
      <div className="page-wrapper">
        <div className="page-body container-xl">
          {children}
        </div>
      </div>
    </div>
  )
}
`.trim()
  )

  const pagesDir = path.join(FRONTEND_ROOT, "pages")
  fs.mkdirSync(pagesDir, { recursive: true })

  fs.writeFileSync(
    path.join(pagesDir, "_app.js"),
    `
import "../styles/globals.css"
import Layout from "../components/Layout"

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
`.trim()
  )
}

function updateDashboard(payload) {
  const pagesDir = path.join(FRONTEND_ROOT, "pages")
  fs.mkdirSync(pagesDir, { recursive: true })

  fs.writeFileSync(
    path.join(pagesDir, "dashboard.js"),
    `
export default function Dashboard() {
  return (
    <div className="row row-cards">
      <div className="col-md-3">
        <div className="card">
          <div className="card-body">Projecten</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body">Calculaties</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body">Inkoop</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body">Planning</div>
        </div>
      </div>
    </div>
  )
}
`.trim()
  )
}

async function poll() {
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "open")
    .eq("assigned_to", "frontend")
    .limit(1)

  if (!tasks || tasks.length === 0) return

  const task = tasks[0]

  await supabase
    .from("tasks")
    .update({ status: "running" })
    .eq("id", task.id)

  await runFrontendTask(task)

  await supabase
    .from("tasks")
    .update({ status: "done" })
    .eq("id", task.id)
}

setInterval(poll, 3000)
