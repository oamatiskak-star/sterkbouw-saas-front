import "../styles/global.css"
import Link from "next/link"

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">SterkBouw</div>

        <nav className="sb-nav">
          <Link href="/project/overzicht">Project</Link>
          <Link href="/calculaties/bouw">Calculaties</Link>
          <Link href="/documenten/bestek">Documenten</Link>
          <Link href="/planning/fasering">Planning</Link>
          <Link href="/inkoop/prijzen">Inkoop</Link>
          <Link href="/risico/analyse">Risico</Link>
          <Link href="/output/dashboard">Dashboard</Link>
        </nav>
      </aside>

      <main className="sb-main">
        <header className="sb-header">
          SterkBouw SaaS
        </header>

        <section className="sb-content">
          <Component {...pageProps} />
        </section>
      </main>
    </div>
  )
}
