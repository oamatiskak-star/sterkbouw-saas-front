import "../styles/global.css"

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">SterkBouw</div>
        <nav className="sb-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/calculator">Calculaties</a>
          <a href="/planning">Planning</a>
          <a href="/cashflow">Cashflow</a>
          <a href="/uploads">Uploads</a>
          <a href="/bim">BIM</a>
        </nav>
      </aside>

      <main className="sb-main">
        <header className="sb-header">
          <div>Breskens Achterkant</div>
        </header>

        <section className="sb-content">
          <Component {...pageProps} />
        </section>
      </main>
    </div>
  )
}
