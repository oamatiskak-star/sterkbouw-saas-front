import Link from "next/link"
import { useRouter } from "next/router"
import { NAVIGATION } from "../config/navigation"
import { ProjectProvider } from "../components/ProjectContext"

export default function AppLayout({ session, children }) {
  const router = useRouter()

  if (!session) return null

  const role = session.role || "admin"

  const isAllowed = item =>
    !item.roles || item.roles.includes(role)

  const visibleNavigation = NAVIGATION
    .filter(isAllowed)
    .map(menu => ({
      ...menu,
      children: (menu.children || []).filter(isAllowed)
    }))

  return (
    <ProjectProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 260, background: "#111827", color: "#fff" }}>
          <div style={{ padding: 20, fontWeight: 700 }}>
            Admin Main
          </div>

          <nav>
            {visibleNavigation.map(menu => {
              const isActive =
                router.pathname === menu.route ||
                router.pathname.startsWith(menu.route + "/")

              return (
                <div key={menu.key}>
                  <Link href={menu.route}>
                    <div
                      style={{
                        padding: "12px 20px",
                        cursor: "pointer",
                        background: isActive ? "#1f2937" : "transparent",
                        fontWeight: 600
                      }}
                    >
                      {menu.label}
                    </div>
                  </Link>

                  {isActive && menu.children && menu.children.length > 0 && (
                    <div style={{ paddingLeft: 12 }}>
                      {menu.children.map(child => {
                        const childActive = router.pathname === child.route

                        return (
                          <Link key={child.key} href={child.route}>
                            <div
                              style={{
                                padding: "8px 20px",
                                cursor: "pointer",
                                background: childActive ? "#374151" : "transparent",
                                fontSize: 14
                              }}
                            >
                              {child.label}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: 24 }}>
          {children}
        </main>
      </div>
    </ProjectProvider>
  )
}
