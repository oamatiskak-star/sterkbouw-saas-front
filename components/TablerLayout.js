import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"
import { AppContext } from "../pages/_app"
import { NAVIGATION } from "../config/navigation"

export default function TablerLayout({ children }) {
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useContext(AppContext)

  return (
    <div className={`page ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="navbar navbar-vertical navbar-expand-lg">
        <div className="container-fluid">
          <div className="navbar-brand d-flex justify-content-between align-items-center">
            <span>Admin Main</span>
            <button
              className="btn btn-sm btn-ghost-secondary"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? "›" : "‹"}
            </button>
          </div>

          <div className="navbar-nav flex-column">
            {NAVIGATION.map(item => {
              const isActive =
                router.pathname === item.route ||
                router.pathname.startsWith(item.route + "/")

              return (
                <div key={item.key} className="nav-item">
                  <Link
                    href={item.route}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    <span className="nav-link-icon">
                      <i className="ti ti-layout-grid"></i>
                    </span>
                    {!sidebarCollapsed && (
                      <span className="nav-link-title">{item.label}</span>
                    )}
                  </Link>

                  {!sidebarCollapsed && item.children && isActive && (
                    <div className="nav nav-sm flex-column ms-3">
                      {item.children.map(sub => {
                        const subActive = router.pathname === sub.route
                        return (
                          <Link
                            key={sub.key}
                            href={sub.route}
                            className={`nav-link ${subActive ? "active" : ""}`}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
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
