import Link from "next/link"

export default function Layout({ children, active }) {
  return (
    <div className="min-h-screen flex bg-gray-200">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col rounded-r-3xl shadow-xl">
        <div className="px-6 py-5 text-lg font-bold border-b border-gray-800">
          SterkBouw SaaS
        </div>

        <nav className="flex-1 px-4 py-4 text-sm space-y-1">
          <Section title="Dashboard">
            <NavItem href="/dashboard" label="Dashboard" active={active === "dashboard"} />
          </Section>

          <Section title="Projecten">
            <NavItem href="/projecten" label="Projecten" active={active === "projecten"} />
          </Section>

          <Section title="Kern flows">
            <NavItem href="/calculaties" label="Calculatie" active={active === "calculaties"} highlight />
            <NavItem
              href="/project-ontwikkeling"
              label="Project Ontwikkeling"
              active={active === "project-ontwikkeling"}
            />
          </Section>

          <Section title="Ondersteunend">
            <NavItem href="/uploads" label="Bestanden" />
            <NavItem href="/bim" label="BIM" />
            <NavItem href="/planning" label="Planning" />
            <NavItem href="/inkoop" label="Inkoop" />
            <NavItem href="/risico" label="Risico" />
          </Section>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white flex items-center justify-between px-8 shadow-sm">
          <div className="text-lg font-semibold">
            Admin Main
          </div>

          <div className="text-sm text-gray-500">
            Ingelogd als admin
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <div className="px-3 mb-2 text-xs uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

function NavItem({ href, label, active, highlight }) {
  const base =
    "block px-3 py-2 rounded-lg transition"

  const normal =
    "text-gray-300 hover:bg-gray-800 hover:text-white"

  const activeStyle =
    "bg-yellow-400 text-gray-900 font-semibold"

  const highlightStyle =
    "bg-gray-800 text-yellow-400 font-semibold"

  return (
    <Link
      href={href}
      className={`${base} ${
        active ? activeStyle : highlight ? highlightStyle : normal
      }`}
    >
      {label}
    </Link>
  )
}
