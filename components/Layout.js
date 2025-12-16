import Link from "next/link"

export default function Layout({ children, active }) {
  const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calculaties", href: "/calculaties" },
    { label: "Projecten", href: "/projecten" },
    { label: "Project Ontwikkeling", href: "/project-ontwikkeling" },
    { label: "Bestanden", href: "/uploads" },
    { label: "BIM", href: "/bim" },
    { label: "Planning", href: "/planning" },
    { label: "Inkoop", href: "/inkoop" },
    { label: "Risico", href: "/risico" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-200">
      <aside className="w-64 bg-gray-900 text-white flex flex-col px-4 py-6 space-y-6">
        <div className="text-xl font-bold">SterkBouw SaaS</div>

        <nav className="space-y-1 text-sm">
          {menu.map((item) => {
            const isActive = active === item.href.replace("/", "")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? "bg-yellow-400 text-black"
                    : "text-white hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-10 bg-gray-100">
        <div className="bg-white shadow-xl rounded-3xl p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
