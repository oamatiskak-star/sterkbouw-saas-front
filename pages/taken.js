import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Taken() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    setTasks(data || [])
  }

  return (
    <div>
      <h1>Taken</h1>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>{t.type}</td>
              <td>{t.status}</td>
              <td>{t.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
