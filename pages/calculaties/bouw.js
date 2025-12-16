import { useState } from "react"

export default function CalculatieBouw() {
  const [opmerking, setOpmerking] = useState("")

  return (
    <div>
      <h1>Calculaties</h1>

      <p>
        Start en beheer alle calculaties vanuit één centrale plek
      </p>

      <div className="grid">

        <div className="card">
          <h3>Basis</h3>
          <button>Nieuwe calculatie</button>
          <button>Calculatie aanpassen</button>
        </div>

        <div className="card">
          <h3>Installaties</h3>
          <button>Electra calculatie</button>
          <button>W-calculatie</button>
          <button>E &amp; W gecombineerd</button>
        </div>

        <div className="card">
          <h3>Bestanden</h3>
          <button>Bestanden uploaden</button>
          <button>Bekijk uploads</button>
        </div>

        <div className="card">
          <h3>BIM & Tekeningen</h3>
          <button>Genereer bouwtekening BIM</button>
          <button>Genereer installatietekening BIM</button>
        </div>

        <div className="card">
          <h3>Ontwerp</h3>
          <button>Ontwerp module projectontwikkeling</button>
        </div>

      </div>

      <div className="card" style={{ maxWidth: 640, marginTop: 24 }}>
        <h3>Opmerking voor calculatie</h3>

        <textarea
          placeholder="Bijvoorbeeld: splits 14 appartementen in 6 voorkant en 8 achterkant"
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            marginBottom: 12
          }}
        />

        <button>Opmerking opslaan</button>
      </div>

    </div>
  )
}
