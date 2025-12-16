import "../styles/global.css"
import Link from "next/link"

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">SterkBouw</div>

        <nav className="sb-nav">
          <Link href="/dashboard">Dashboard</Link>

          <hr style={{ margin: "16px 0", opacity: 0.2 }} />

          <strong style={{ fontSize: 12, opacity: 0.7 }}>PROJECTEN</strong>
          <Link href="/projecten">Projecten</Link>

          <hr style={{ margin: "16px 0", opacity: 0.2 }} />

          <strong style={{ fontSize: 12, opacity: 0.7 }}>KERN FLOWS</strong>
          <Link href="/calculaties">Calculatie</Link>
          <Link href="/project-ontwikkeling">Project Ontwikkeling</Link>

          <hr style={{ margin: "16px 0", opacity: 0.2 }} />

          <strong style={{ fontSize: 12, opacity: 0.7 }}>ONDERSTEUNEND</strong>
          <Link href="/uploads">Bestanden</Link>
          <Link href="/bim">BIM</Link>
          <Link href="/planning">Planning</Link>
          <Link href="/inkoop">Inkoop</Link>
          <Link href="/risico">Risico</Link>
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
