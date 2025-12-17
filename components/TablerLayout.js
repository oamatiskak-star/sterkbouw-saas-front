import Link from "next/link"
import { useRouter } from "next/router"

export default function TablerLayout({ children }) {
const router = useRouter()

const menu = [
{ label: "Dashboard", href: "/dashboard" },
{ label: "Projecten", href: "/projecten/overzicht" },
{ label: "Calculaties", href: "/calculaties" },
{ label: "BIM & Tekeningen", href: "/bim" },
{ label: "Ontwerp", href: "/ontwerp" },
{ label: "Bestanden", href: "/bestanden" }
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
          <Link
            key={item.href}
            href={item.href}
            className={
              "nav-link" +
              (router.pathname.startsWith(item.href) ? " active" : "")
            }
          >
            <span className="nav-link-title">{item.label}</span>
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
