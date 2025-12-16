export default function Calculaties() {
  return (
    <div className="flow-page">
      <h1>Calculaties</h1>
      <p className="flow-subtitle">
        Start en beheer alle calculaties vanuit één centrale plek
      </p>

      <div className="flow-grid">

        <div className="flow-card">
          <h2>Basis</h2>
          <button>Nieuwe calculatie</button>
          <button>Calculatie aanpassen</button>
          <button>Opmerking voor calculatie</button>
        </div>

        <div className="flow-card">
          <h2>Installaties</h2>
          <button>Electra calculatie</button>
          <button>W-calculatie</button>
          <button>E & W gecombineerd</button>
        </div>

        <div className="flow-card">
          <h2>Bestanden</h2>
          <button>Bestanden uploaden</button>
          <button>Bekijk uploads</button>
        </div>

        <div className="flow-card">
          <h2>BIM & Tekeningen</h2>
          <button>Genereer bouwtekening BIM</button>
          <button>Genereer installatietekening BIM</button>
        </div>

        <div className="flow-card">
          <h2>Ontwerp</h2>
          <button>Ontwerp module projectontwikkeling</button>
        </div>

      </div>
    </div>
  )
}
