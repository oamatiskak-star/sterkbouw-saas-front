import Link from "next/link"
import { useRouter } from "next/router"

export default function ModulePage({ module }) {
  const router = useRouter()

  if (!module) return null

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        {module.label}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {(module.children || []).map(child => {
          const active = router.pathname === child.route

          return (
            <Link key={child.key} href={child.route}>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                  cursor: "pointer",
                  background: active ? "#f9fafb" : "#fff"
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {child.label}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Open
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
