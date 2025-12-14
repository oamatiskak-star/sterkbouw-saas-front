import "../styles/global.css"
import { modules } from "../lib/modules"

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">SterkBouw</div>

        <nav className="sb-nav">
          {modules.map(m => (
            <a key={m.slug} href={`/${m.slug}`}>
              {m.title}
            </a>
          ))}
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
