import navigation from "../config/navigation"
import Link from "next/link"
import { useRouter } from "next/router"

export default function AppLayout({ session, children }) {
  const router = useRouter()

  if (!session) return null

  const role = session.role || "admin"

  const visibleMenu = navigation.filter(item =>
    item.roles.includes(role)
  )

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 260, background: "#111827", color: "#fff" }}>
        <div style={{ padding: 20, fontWeight: 700 }}>
          Admin Main
        </div>

        <nav>
          {visibleMenu.map(item => (
            <Link key={item.key} href={item.path}>
              <div
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  background: router.pathname.startsWith(item.path)
                    ? "#1f2937"
                    : "transparent"
                }}
              >
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  )
}
