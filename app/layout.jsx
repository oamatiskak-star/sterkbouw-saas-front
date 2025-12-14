import "./globals.css"

export const metadata = {
title: "SterkBouw SaaS",
description: "SterkBouw dashboard"
}

export default function RootLayout({ children }) {
return (
<html lang="nl">
<body>
<div className="sb-app">
<aside className="sb-sidebar">
<div className="sb-logo">SterkBouw</div>
<nav className="sb-nav">
<a href="/dashboard">Dashboard</a>
<a href="/projecten">Projecten</a>
<a href="/calculaties">Calculaties</a>
<a href="/stabu">STABU Calculator</a>
<a href="/fixed-price">Fixed Price</a>
<a href="/bim">BIM Architect</a>
<a href="/constructeurs">Constructeurs</a>
<a href="/analyse">Analyse & Risico</a>
<a href="/kopersportaal">Kopersportaal</a>
<a href="/documenten">Documenten</a>
<a href="/instellingen">Instellingen</a>
</nav>
</aside>

      <main className="sb-main">
        <header className="sb-header">
          <div className="sb-header-left">Dashboard</div>
          <div className="sb-header-right">Ingelogd</div>
        </header>

        <section className="sb-content">
          {children}
        </section>
      </main>
    </div>
  </body>
</html>


)
}
