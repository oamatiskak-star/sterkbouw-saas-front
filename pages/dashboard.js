import Sidebar from "@/components/Sidebar"
import Head from "next/head"

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | SterkBouw SaaS</title>
      </Head>
      <div className="sb-dashboard">
        <Sidebar active="dashboard" />

        <main className="sb-content">
          <h1 className="sb-title">Dashboard</h1>

          <section className="sb-section">
            <h2 className="sb-section-title">Project</h2>
            <div className="sb-button-group">
              <button className="sb-button">Nieuw project</button>
              <button className="sb-button">Project aanpassen</button>
              <button className="sb-button">Projectoverzicht</button>
            </div>
          </section>

          <section className="sb-section">
            <h2 className="sb-section-title">Calculaties</h2>
            <div className="sb-button-group">
              <button className="sb-button">Bouwkundige calculatie</button>
              <button className="sb-button">E/W calculatie</button>
              <button className="sb-button">Complete calculatie</button>
            </div>
          </section>

          <section className="sb-section">
            <h2 className="sb-section-title">Uploads</h2>
            <div className="sb-button-group">
              <button className="sb-button">Upload tekeningen</button>
              <button className="sb-button">Upload bestek</button>
              <button className="sb-button">Upload offertes</button>
            </div>
          </section>

          <section className="sb-section">
            <h2 className="sb-section-title">Tekeningen & BIM</h2>
            <div className="sb-button-group">
              <button className="sb-button">Tekeningset genereren</button>
              <button className="sb-button">BIM openen</button>
            </div>
          </section>

          <section className="sb-section">
            <h2 className="sb-section-title">Rapportages</h2>
            <div className="sb-button-group">
              <button className="sb-button">Dashboard rapport</button>
              <button className="sb-button">PDF export</button>
              <button className="sb-button">Excel export</button>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
