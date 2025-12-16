import { useRouter } from "next/router"

export default function CalculatiesHome() {
  const router = useRouter()

  return (
    <div>
      <h1>Calculaties</h1>

      <p style={{ marginBottom: 24 }}>
        Start hier een nieuwe calculatie, upload bestanden of genereer tekeningen.
      </p>

      <div className="grid">
        <div className="card">
          <h3>Nieuwe calculatie</h3>
          <button onClick={() => router.push("/calculaties/nieuw")}>
            Start bouwcalculatie
          </button>
        </div>

        <div className="card">
          <h3>Calculatie aanpassen</h3>
          <button onClick={() => router.push("/calculaties/beheer")}>
            Open bestaande calculatie
          </button>
        </div>

        <div className="card">
          <h3>Electra calculatie</h3>
          <button onClick={() => router.push("/calculaties/ew?type=elektra")}>
            Start E-calculatie
          </button>
        </div>

        <div className="card">
          <h3>Water / Verwarming</h3>
          <button onClick={() => router.push("/calculaties/ew?type=water")}>
            Start W-calculatie
          </button>
        </div>

        <div className="card">
          <h3>E & W gecombineerd</h3>
          <button onClick={() => router.push("/calculaties/ew?type=combined")}>
            Start E&W calculatie
          </button>
        </div>

        <div className="card">
          <h3>Bestanden uploaden</h3>
          <button onClick={() => router.push("/uploads")}>
            Upload tekeningen en documenten
          </button>
        </div>

        <div className="card">
          <h3>BIM bouwtekening</h3>
          <button onClick={() => router.push("/bim/bouw")}>
            Genereer bouwtekening
          </button>
        </div>

        <div className="card">
          <h3>BIM installatietekening</h3>
          <button onClick={() => router.push("/bim/installatie")}>
            Genereer installatietekening
          </button>
        </div>

        <div className="card">
          <h3>Ontwerp & ontwikkeling</h3>
          <button onClick={() => router.push("/project-ontwikkeling")}>
            Start ontwerp module
          </button>
        </div>

        <div className="card">
          <h3>Opmerking voor calculatie</h3>
          <button onClick={() => router.push("/calculaties/opmerkingen")}>
            Voeg projectopmerking toe
          </button>
        </div>
      </div>
    </div>
  )
}
