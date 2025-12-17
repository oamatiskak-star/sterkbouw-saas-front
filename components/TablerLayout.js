import Link from "next/link"
import { useRouter } from "next/router"

export default function TablerLayout({ children }) {
const router = useRouter()

const menu = [
{
label: "Dashboard",
href: "/dashboard"
},
{
label: "Projecten",
href: "/projecten/overzicht",
children: [
{ label: "Overzicht", href: "/projecten/overzicht" },
{ label: "Nieuw project", href: "/projecten/nieuw" }
]
},
{
label: "Calculaties",
href: "/calculaties",
children: [
{ label: "STABU calculator", href: "/calculaties/stabu" },
{ label: "Fixed Price", href: "/calculaties/fixed-price" }
]
},
{
label: "Ontwerp & BIM",
href: "/bim",
children: [
{ label: "BIM Architect", href: "/bim/architect" },
{ label: "Constructeurs", href: "/bim/constructeurs" },
{ label: "E en W", href: "/bim/ew" }
]
},
{
label: "Portalen",
href: "/portalen",
children: [
{ label: "Kopersportaal", href: "/portalen/kopers" },
{ label: "Huurdersportaal", href: "/portalen/huurders" }
]
},
{
label: "Financiën",
href: "/financien",
children: [
{ label: "Investeringen", href: "/financien/investeringen" },
{ label: "Cashflow", href: "/financien/cashflow" },
{ label: "Rapportages", href: "/financien/rapportages" }
]
},
{
label: "Instellingen",
href: "/instellingen",
children: [
{ label: "Gebruikers", href: "/instellingen/gebruikers" },
{ label: "Rollen", href: "/instellingen/rollen" },
{ label: "Systeem", href: "/instellingen/systeem" }
]
}
]

return (
<div className="page">
<aside className="navbar navbar-vertical navbar-expand-lg">
<div className="container-fluid">
<h1 className="navbar-brand navbar-brand-autodark">
Admin Main
</h1>

      <div className="navbar-nav flex-column">
        {menu.map(item => (
          <div key={item.label} className="nav-item">
            <Link
              href={item.href}
              className={
                "nav-link" +
                (router.pathname.startsWith(item.href) ? " active" : "")
              }
            >
              <span className="nav-link-title">{item.label}</span>
            </Link>

            {item.children && (
              <div className="nav nav-sm flex-column ms-3">
                {item.children.map(sub => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={
                      "nav-link" +
                      (router.pathname === sub.href ? " active" : "")
                    }
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
