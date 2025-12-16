export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div className="grid">

        <div className="card">
          <h3>Project</h3>
          <button>Nieuw project</button>
          <button>Project aanpassen</button>
          <button>Projectoverzicht</button>
        </div>

        <div className="card">
          <h3>Calculaties</h3>
          <button>Bouwkundige calculatie</button>
          <button>E/W calculatie</button>
          <button>Complete calculatie</button>
        </div>

        <div className="card">
          <h3>Uploads</h3>
          <button>Upload tekeningen</button>
          <button>Upload bestek</button>
          <button>Upload offertes</button>
        </div>

        <div className="card">
          <h3>Tekeningen & BIM</h3>
          <button>Tekeningset genereren</button>
          <button>BIM openen</button>
        </div>

        <div className="card">
          <h3>Rapportages</h3>
          <button>Dashboard rapport</button>
          <button>PDF export</button>
          <button>Excel export</button>
        </div>

      </div>
    </div>
  )
}
