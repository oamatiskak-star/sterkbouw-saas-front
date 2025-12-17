import Head from "next/head"
import KpiGrid from "../components/KpiGrid"

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | SterkBouw SaaS</title>
      </Head>

      <h1 className="page-title mb-6">Dashboard</h1>

      {/* KPI BLOKKEN */}
      <KpiGrid module="dashboard" />

      {/* PROJECT ACTIES */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Projecten</h2>

        <div className="d-flex flex-wrap gap-3">
          <a href="/projecten/nieuw" className="btn btn-warning">
            Nieuw project
          </a>

          <a href="/projecten" className="btn btn-warning">
            Projectoverzicht
          </a>
        </div>
      </section>

      {/* CALCULATIES ACTIES */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Calculaties</h2>

        <div className="d-flex flex-wrap gap-3">
          <a href="/calculaties/bouw" className="btn btn-warning">
            Bouwkundige calculatie
          </a>

          <a href="/calculaties/ew" className="btn btn-warning">
            E/W calculatie
          </a>

          <a href="/calculaties" className="btn btn-warning">
            Complete calculatie
          </a>
        </div>
      </section>
    </>
  )
}
