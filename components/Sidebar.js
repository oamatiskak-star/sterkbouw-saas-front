import { useRouter } from "next/router"

export default function Sidebar() {
  const router = useRouter()
  const current = router.pathname

  const navItems = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Projecten", link: "/projecten" },
    { label: "Calculaties", link: "/calculator" },
    { label: "STABU", link: "/stabu-calculator" },
    { label: "Fixed Price", link: "/fixed-price" },
    { label: "BIM", link: "/bim" },
    { label: "Constructeurs", link: "/constructeurs" },
    { label: "E/W", link: "/ew" },
    { label: "Risico", link: "/risico" },
    { label: "Kopersportaal", link: "/kopersportaal" },
    { label: "Documenten", link: "/documenten" },
    { label: "Uploads", link: "/uploads" },
    { label: "Team", link: "/team" },
    { label: "Notificaties", link: "/notificaties" },
    { label: "Instellingen", link: "/admin" }
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        SterkBouw SaaS
      </div>

      <nav className="flex-1 p-4 space-y-1 text-sm">
        {navItems.map(({ label, link }) => (
          <NavLink
            key={link}
            label={label}
            link={link}
            active={current === link}
          />
        ))}
      </nav>
    </aside>
  )
}

function NavLink({ label, link, active }) {
  return (
    <a
      href={link}
      className={`block px-3 py-2 rounded font-medium ${
        active
          ? "bg-yellow-400 text-black"
          : "hover:bg-gray-800 text-white"
      }`}
    >
      {label}
    </a>
  )
}
