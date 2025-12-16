import Link from "next/link"

export default function CalculatiesIndex() {
  return (
    <div>
      <h1>Calculaties</h1>
      <p>Start en beheer alle calculaties vanuit één centrale plek</p>

      {/* BASIS */}
      <h2>Basis</h2>
      <div className="grid">
        <Link href="/calculaties/bouw">
          <button>Nieuwe calculatie</button>
        </Link>

        <button>Calculatie aanpassen</button>

        <button>Opmerking voor calculatie</button>
      </div>

      {/* INSTALLATIES */}
      <h2 style={{ marginTop: 30 }}>Installaties</h2>
      <div className="grid">
        <button>Electra calculatie</button>
        <button>W-calculatie</button>
        <button>E &amp; W gecombineerd</button>
      </div>

      {/* BESTANDEN */}
      <h2 style={{ marginTop: 30 }}>Bestanden</h2>
      <div className="grid">
        <Link href="/uploads">
          <button>Bestanden uploaden</button>
        </Link>

        <button>Bekijk uploads</button>
      </div>

      {/* BIM */}
      <h2 style={{ marginTop: 30 }}>BIM & Tekeningen</h2>
      <div className="grid">
        <button>Genereer bouwtekening BIM</button>
        <button>Genereer installatietekening BIM</button>
      </div>

      {/* ONTWERP */}
      <h2 style={{ marginTop: 30 }}>Ontwerp</h2>
      <div className="grid">
        <Link href="/project-ontwikkeling">
          <button>Ontwerp module projectontwikkeling</button>
        </Link>
      </div>
    </div>
  )
}
