import { useState } from "react"

export default function CalculatieBouw() {
  const [opmerking, setOpmerking] = useState("")

  return (
    <div>
      <h1>Calculatie module</h1>

      {/* ACTIEKNOPPEN */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 30
        }}
      >
        <button>Nieuwe calculatie</button>
        <button>Calculatie aanpassen</button>

        <button>Electra calculatie</button>
        <button>W calculatie</button>
        <button>E &amp; W calculatie gecombineerd</button>

        <button>Bestanden uploaden</button>

        <button>Genereer bouwtekening BIM</button>
        <button>Genereer installatietekening BIM</button>

        <button>Ontwerp module (projectontwikkeling)</button>
      </div>

      {/* OPMERKINGEN */}
      <div style={{ maxWidth: 600 }}>
        <h2>Opmerking voor calculatie</h2>

        <textarea
          placeholder="Bijvoorbeeld: splits 14 appartementen in 6 voorkant en 8 achterkant"
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 14,
            borderRadius: 4,
            border: "1px solid #e5e7eb"
          }}
        />

        <div style={{ marginTop: 10 }}>
          <button>Opmerking opslaan</button>
        </div>
      </div>
    </div>
  )
}
