export default function Layout({ children }) {
  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-logo">
          SterkBouw
        </div>

        <nav className="sb-nav">
          <MenuLink label="Dashboard" link="/dashboard" />
          <MenuLink label="Projecten" link="/projecten" />
          <MenuLink label="Calculaties" link="/calculaties" />
          <MenuLink label="Projectontwikkeling" link="/ontwikkeling" />
          <MenuLink label="Documenten" link="/documenten" />
          <MenuLink label="Planning" link="/planning" />
          <MenuLink label="Inkoop" link="/inkoop" />
          <MenuLink label="Risico" link="/risico" />
          <MenuLink label="BIM Architect" link="/bim" />
          <MenuLink label="Constructeurs" link="/constructeurs" />
          <MenuLink label="Kopersportaal" link="/kopersportaal" />
          <MenuLink label="Instellingen" link="/admin" />
        </nav>
      </aside>

      <div className="sb-main">
        <header className="sb-header">
          <div className="sb-header-title">
            SterkBouw SaaS
          </div>

          <div className="sb-header-actions">
            <HeaderButton label="Nieuwe calculatie" />
            <HeaderButton label="Upload bestanden" />
            <HeaderButton label="Nieuw project" />
          </div>
        </header>

        <main className="sb-content">
          {children}
        </main>
      </div>
    </div>
  )
}

function MenuLink({ label, link }) {
  return (
    <a href={link} className="sb-menu-link">
      {label}
    </a>
  )
}

function HeaderButton({ label }) {
  return (
    <button className="sb-header-button">
      {label}
    </button>
  )
}
