import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function InkoopDashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from("v_inkoop_overzicht")
        .select("*")
        .order("project_naam", { ascending: true })

      if (!cancelled) {
        if (error) {
          console.error("INKOOP_OVERZICHT_LOAD_FAILED", error)
          setRows([])
        } else {
          setRows(data || [])
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
    <>
      <h1>Inkoop</h1>

      {rows.length === 0 && (
        <p>Geen inkoopdata beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Discipline</th>
              <th>Begroot</th>
              <th>Ingekocht</th>
              <th>Openstaand</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
