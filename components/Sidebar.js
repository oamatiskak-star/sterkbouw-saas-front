import Link from "next/link"
import { useRouter } from "next/router"
import { MENU } from "../lib/menu"

export default function Sidebar() {
const router = useRouter()

return (
<aside style={{ width: 260, padding: 20, borderRight: "1px solid #eee" }}>
<strong style={{ display: "block", marginBottom: 16 }}>
Admin Main
</strong>

  {MENU.map(menu => (
    <div key={menu.key} style={{ marginBottom: 20 }}>
      <Link href={menu.route}>
        <div
          style={{
            fontWeight: router.pathname.startsWith(menu.route)
              ? "bold"
              : "normal",
            cursor: "pointer"
          }}
        >
          {menu.label}
        </div>
      </Link>

      {menu.children && (
        <div style={{ marginLeft: 12, marginTop: 8 }}>
          {menu.children.map(sub => (
            <Link key={sub.route} href={sub.route}>
              <div
                style={{
                  fontSize: 14,
                  padding: "4px 0",
                  cursor: "pointer",
                  color:
                    router.pathname === sub.route
                      ? "#f59e0b"
                      : "#444"
                }}
              >
                {sub.label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  ))}
</aside>


)
}
