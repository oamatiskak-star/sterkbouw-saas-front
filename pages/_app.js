import "../styles/global.css"
import { menuConfig } from "../lib/menuConfig"

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">SterkBouw</div>
        <nav className="sb-nav">
          {menuConfig.map(m => (
            <div key={m.key} className="sb-group">
              <div className="sb-group-title">{m.title}</div>
              {m.actions.map(a => (
                <a key={a.id} href={`/actie/${a.id}`}>{a.label}</a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="sb-main">
        <header className="sb-header"><div>Dashboard</div></header>
        <section className="sb-content"><Component {...pageProps} /></section>
      </main>
    </div>
  )
}
