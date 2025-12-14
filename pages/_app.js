import "../styles/globals.css"

export default function MyApp({ Component, pageProps }) {
return (
<div className="sb-app">
<aside className="sb-sidebar">
<div className="sb-logo">SterkBouw</div>
<nav className="sb-nav">
<a href="/dashboard">Dashboard</a>
<a href="/projecten">Projecten</a>
<a href="/calculator">Calculaties</a>
<a href="/stabu-calculator">STABU</a>
<a href="/bim">BIM</a>
<a href="/constructeurs">Constructeurs</a>
<a href="/risicoanalyse">Risico</a>
<a href="/kopersportaal">Kopersportaal</a>
</nav>
</aside>

  <main className="sb-main">
    <header className="sb-header">
      <div>Dashboard</div>
      <div>Ingelogd</div>
    </header>

    <section className="sb-content">
      <Component {...pageProps} />
    </section>
  </main>
</div>


)
}
