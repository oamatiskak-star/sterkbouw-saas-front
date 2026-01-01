import Link from "next/link"

export default function TablerLayout({ children }) {
  const menu = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "administratie", label: "Administratie", href: "/administratie" },
    { key: "bim", label: "BIM", href: "/bim" },
    { key: "bouwplaats", label: "Bouwplaats", href: "/bouwplaats" },
    { key: "calculatie", label: "Calculatie", href: "/calculatie" },
    { key: "constructie", label: "Constructie", href: "/constructie" },
    { key: "documenten", label: "Documenten", href: "/documenten" },
    { key: "financien", label: "Financiën", href: "/financien" },
    { key: "financieringen", label: "Financieringen", href: "/financieringen" },
    { key: "inkoop", label: "Inkoop", href: "/inkoop" },
    { key: "kopersportaal", label: "Kopersportaal", href: "/kopersportaal" },
    { key: "mail", label: "Mail", href: "/mail" },
    { key: "planning", label: "Planning", href: "/planning" },
    { key: "projecten", label: "Projecten", href: "/projecten" },
    { key: "projectportaal", label: "Projectportaal", href: "/projectportaal" },
    { key: "instellingen", label: "Instellingen", href: "/instellingen" }
  ]

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="menu">
        <div className="px-4 py-4 border-b border-gray-300 font-semibold text-lg">
          SterkBouw
        </div>

        <nav className="flex flex-col mt-2">
          {menu.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className="menu-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="page-wrapper">
          <div className="page-body">
            <div className="container-xl">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
