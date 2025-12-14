import Link from "next/link"

export default function DashboardLayout({ children }) {
return (
<div className="app-shell">
<aside className="sidebar">
<h2>SterkBouw</h2>
<nav>
<Link href="/dashboard">Dashboard</Link>
<Link href="/calculaties">Calculaties</Link>
<Link href="/projecten">Projecten</Link>
<Link href="/bim">BIM Architectuur</Link>
<Link href="/risicoanalyse">Risico Analyse</Link>
<Link href="/notificaties">Notificaties</Link>
<Link href="/team">Teambeheer</Link>
</nav>
</aside>

  <main className="content">
    {children}
  </main>
</div>


)
}
