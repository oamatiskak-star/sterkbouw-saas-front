export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          SterkBouw
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm">
          <MenuLink label="Dashboard" link="/dashboard" />
          <MenuLink label="Projecten" link="/projecten" />
          <MenuLink label="Calculaties" link="/calculator" />
          <MenuLink label="STABU Calculator" link="/stabu-calculator" />
          <MenuLink label="Fixed Price" link="/fixed-price" />
          <MenuLink label="BIM Architect" link="/bim" />
          <MenuLink label="Constructeurs" link="/constructeurs" />
          <MenuLink label="E en W" link="/ew" />
          <MenuLink label="Risico Analyse" link="/risico" />
          <MenuLink label="Kopersportaal" link="/kopersportaal" />
          <MenuLink label="Documenten" link="/documenten" />
          <MenuLink label="Uploads" link="/uploads" />
          <MenuLink label="Installatie" link="/installatie" />
          <MenuLink label="Team" link="/team" />
          <MenuLink label="Notificaties" link="/notificaties" />
          <MenuLink label="Instellingen" link="/admin" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="text-lg font-semibold">
            SterkBouw SaaS
          </div>

          <div className="flex items-center space-x-3">
            <ActionButton label="Nieuwe calculatie" />
            <ActionButton label="Upload bestanden" />
            <ActionButton label="Nieuw project" />
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function MenuLink({ label, link }) {
  return (
    <a href={link} className="block px-3 py-2 rounded hover:bg-gray-800">
      {label}
    </a>
  )
}

function ActionButton({ label }) {
  return (
    <button className="px-3 py-2 bg-yellow-400 text-black rounded text-sm font-medium">
      {label}
    </button>
  )
}
