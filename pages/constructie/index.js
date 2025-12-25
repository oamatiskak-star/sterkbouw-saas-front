import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function ConstructieDashboard() {
  const [projecten, setProjecten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from("projecten")
        .select("id, naam, status")
        .order("created_at", { ascending: false })

      if (!cancelled) {
        if (error) {
          console.error("CONSTRUCTIE_LOAD_FAILED", error)
          setProjecten([])
        } else {
          setProjecten(data || [])
        }
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return null

  return (
    <div style={{ padding: 16 }}>
      <h1>Constructie berekenen – Dashboard</h1>

      {projecten.length === 0 && (
        <p>Geen projecten beschikbaar.</p>
      )}

      {projecten.map(p => (
        <div
          key={p.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12
          }}
