import { useRouter } from "next/router"

export default function ProjectOntwikkelingHome() {
  const router = useRouter()

  return (
    <div>
      <h1>Project Ontwikkeling</h1>

      <p style={{ marginBottom: 24 }}>
        Beheer hier de volledige ontwikkeling van een project.
        Van input tot plan, van ontwerp tot uitvoer.
      </p>

      <div className="grid">
        <div className="card">
          <h3>Nieuw ontwikkelproject</h3>
          <button onClick={() => router.push("/project-ontwikkeling/nieuw")}>
            Start nieuw project
          </button>
        </div>

        <div className="card">
          <h3>Project aanpassen</h3>
          <button onClick={() => router.push("/project-ontwikkeling/beheer")}>
            Open bestaand project
          </button>
        </div>

        <div className="card">
          <h3>Bestanden uploaden</h3>
          <button onClick={() => router.push("/uploads")}>
            Upload stukken en tekeningen
          </button>
        </div>

        <div className="card">
          <h3>Genereer ontwikkelplan</h3>
          <button onClick={() => router.push("/project-ontwikkeling/plan")}>
            Laat agent plan maken
          </button>
        </div>

        <div className="card">
          <h3>Genereer bouwplan</h3>
          <button onClick={() => router.push("/project-ontwikkeling/bouwplan")}>
            Bouwkundig plan
          </button>
        </div>

        <div className="card">
          <h3>3D / BIM modellen</h3>
          <button onClick={() => router.push("/bim")}>
            Genereer 3D & BIM
          </button>
        </div>

        <div className="card">
          <h3>Renders & visualisaties</h3>
          <button onClick={() => router.push("/project-ontwikkeling/renders")}>
            Genereer renders
          </button>
        </div>

        <div className="card">
          <h3>Risico & haalbaarheid</h3>
          <button onClick={() => router.push("/risico")}>
            Analyse & risico’s
          </button>
        </div>

        <div className="card">
          <h3>Opmerkingen & instructies</h3>
          <button onClick={() => router.push("/project-ontwikkeling/opmerkingen")}>
            Geef input aan agent
          </button>
        </div>
      </div>
    </div>
  )
}
