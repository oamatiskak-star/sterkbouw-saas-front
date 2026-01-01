import Link from "next/link"

export default function TablerLayout({ children }) {
  const menu = [
    { key: "nieuw_project", label: "Nieuw project", href: "/nieuw-project" },
    { key: "projecten", label: "Projecten", href: "/projecten" },
    { key: "calculaties", label: "Calculaties", href: "/calculaties" },
    { key: "financiering", label: "Financiering", href: "/financiering" },
    { key: "projectontwikkeling", label: "Projectontwikkeling", href: "/projectontwikkeling" },
    { key: "bim", label: "Ontwerp & BIM", href: "/bim" },
    { key: "constructie", label: "Constructie", href: "/constructie" },
    { key: "financien", label: "Financiën", href: "/financien" },
    { key: "investeringen", label: "Investeringen", href: "/investeringen" },
    { key: "mail", label: "Mail", href: "/mail" },
    { key: "instellingen", label: "Instellingen", href: "/instellingen" }
  ]

  return (
    <div className="page">
      <aside className="navbar navbar-vertical navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#sidebar-menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <h1 className="navbar-brand navbar-brand-autodark">
            <Link href="/" className="navbar-brand-link">
              Admin Main
            </Link>
          </h1>

          <div className="collapse navbar-collapse" id="sidebar-menu">
            <ul className="navbar-nav pt-lg-3">
              {menu.map(item => (
                <li className="nav-item" key={item.key}>
                  <Link href={item.href} className="nav-link">
                    <span className="nav-link-title">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
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
