import Link from "next/link"

export default function TablerLayout({ children }) {
  const menu = [
    { label: "Nieuw Project", href: "/nieuw-project" },
    { label: "Projecten", href: "/projecten" },
    { label: "Calculaties", href: "/calculaties" },
    { label: "Financiering", href: "/financiering" },
    { label: "Projectontwikkeling", href: "/projectontwikkeling" },
    { label: "Ontwerp en BIM", href: "/bim" },
    { label: "Constructie", href: "/constructie" },
    { label: "Financiën", href: "/financien" },
    { label: "Investeringen", href: "/investeringen" },
    { label: "Mail", href: "/mail" },
    { label: "Instellingen", href: "/instellingen" }
  ]

  return (
    <div className="page">
      <aside className="navbar navbar-vertical navbar-expand-lg">
        <div className="container-fluid">
          <div className="navbar-brand">Admin Main</div>

          <div className="navbar-nav flex-column">
            {menu.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
