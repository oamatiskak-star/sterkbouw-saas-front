import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function BIM() {
  const [items, setItems] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("results")
      .select("*")
      .eq("type", "bim_meetstaat")
      .order("created_at", { ascending: false })
      .limit(1)

    setItems(data?.[0]?.data || [])
  }

  return (
    <div>
      <h1>BIM Meetstaat</h1>
      <table>
        <thead>
          <tr>
            <th>Onderdeel</th>
            <th>Hoeveelheid</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.onderdeel}</td>
              <td>{i.hoeveelheid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
