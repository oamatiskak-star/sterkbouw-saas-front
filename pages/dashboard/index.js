import Link from "next/link"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function DashboardPage() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from("modules")
        .select("key,label,route,icon,sort_order")
        .eq("active", true)
        .not("route", "like", "%/%/%")
        .neq("route", "/dashboard")
        .order("sort_order", { ascending: true })

      if (!cancelled) {
        if (error) {
          console.error("DASHBOARD_MODULES_LOAD_FAILED", error)
          setModules([])
        } else {
          setModules(data || [])
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1 className="mb-4">Dashboard</h1>

      <div className="row row-cards mb-4">
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="h3">0</div>
              <div className="text-muted">Actieve projecten</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="h3">€ 0</div>
              <div className="text-muted">Cashflow</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cards">
        {modules.map(m => (
          <div key={m.key} className="col-md-3">
            <Link href={m.route}>
