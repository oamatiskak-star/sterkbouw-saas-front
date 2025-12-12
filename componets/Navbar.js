import Link from "next/link"
import { useRouter } from "next/router"

export default function Navbar() {
  const router = useRouter()
  const currentPath = router.pathname

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calculator", href: "/calculator" },
    { label: "Risico", href: "/risico" },
    { label: "BIM", href: "/bim" },
    { label: "Projecten", href: "/projecten" },
    { label: "Notificaties", href: "/notificaties" },
    { label: "Team", href: "/team" }
  ]

  return (
    <nav className="bg-black text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-bold text-yellow-400">SterkBouw</div>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-yellow-400 ${
                currentPath === item.href ? "text-yellow-400 underline" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
