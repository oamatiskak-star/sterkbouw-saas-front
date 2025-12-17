import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"
import { AppContext } from "../pages/_app"

export default function TablerLayout({ children }) {
const router = useRouter()
const { sidebarCollapsed, toggleSidebar, role } = useContext(AppContext)

const menu = [
{
label: "Dashboard",
href: "/dashboard",
icon: "home"
},
{
label: "Projecten",
href: "/projecten/overzicht",
icon: "building",
children: [
{ label: "Overzicht", href: "/projecten/overzicht" },
{ label: "Nieuw project", href: "/projecten/nieuw" }
]
},
{
label: "Calculaties",
href: "/calculaties",
icon: "calculator",
children: [
{ label: "STABU calculator", href: "/calculaties/stabu" },
{ label: "Fixed Price", href: "/calculaties/fixed-price" }
]
},
{
label: "Ontwerp & BIM",
href: "/bim",
icon: "cube",
children: [
{ label: "BIM Architect", href: "/bim/architect" },
{ label: "Constructeurs", href: "/bim/constructeurs" },
{ label: "E en W", href: "/bim/ew" }
]
},
{
label: "Portalen",
href: "/portalen",
icon: "users",
children: [
{ label: "Kopersportaal", href: "/portalen/kopers" },
{ label: "Huurdersportaal", href: "/portalen/huurders" }
]
},
{
label: "Financiën",
href: "/financien",
icon: "cash",
children: [
{ label: "Investeringen", href: "/financien/investeringen" },
{ label: "Cashflow", href: "/financien/cashflow" },
{ label: "Rapportages", href: "/financien/rapportages" }
]
},
{
label: "Instellingen",
href: "/instellingen",
icon: "settings",
children: [
{ label: "Gebruikers", href: "/instellingen/gebruikers" },
{ label: "Rollen", href: "/instellingen/rollen" },
{ label: "Systeem", href: "/instellingen/systeem" }
]
}
]

return (
<div className={"page" + (sidebarCollapsed ? " sidebar-collapsed" : "")}>
<aside className="navbar navbar-vertical navbar-expand-lg">
<div className="container-fluid">
<div className="navbar-brand d-flex justify-content-between align-items-center">
<span>Admin Main</span>
<button className="btn btn-sm btn-ghost-secondary" onClick={toggleSidebar} >
{sidebarCollapsed ? "›" : "‹"}
</button>
</div>

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
              <span className="nav-link-icon">
                <i className={"ti ti-" + item.icon}></i>
              </span>
              {!sidebarCollapsed && (
                <span className="nav-link-title">{item.label}</span>
              )}
            </Link>

            {!sidebarCollapsed && item.children && (
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
