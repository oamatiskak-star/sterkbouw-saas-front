import Link from "next/link"

export default function DashboardLayout({ children }) {
  return (
    <div className="sb-app-shell">
      <aside className="sb-sidebar">
        <div className="sb-logo">
          SterkBouw SaaS
        </div>

        <nav className="sb-nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/calculaties">Calculaties</Link>
          <Link href="/projecten">Projecten</Link>
          <Link href="/bim">BIM Architectuur</Link>
          <Link href="/risicoanalyse">Risico Analyse</Link>
          <Link href="/notificaties">Notificaties</Link>
          <Link href="/team">Teambeheer</Link>
        </nav>
      </aside>

      <main className="sb-content">
        {children}
      </main>
    </div>
  )
}
