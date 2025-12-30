import Link from 'next/link'
import { useRouter } from 'next/router'

const MENU = [
  ['Dashboard', '/dashboard'],
  ['Administratie', '/administratie'],
  ['BIM', '/bim'],
  ['Bouwplaats', '/bouwplaats'],
  ['Calculatie', '/calculatie'],
  ['Constructie', '/constructie'],
  ['Documenten', '/documenten'],
  ['Financiën', '/financien'],
  ['Financieringen', '/financieringen'],
  ['Inkoop', '/inkoop'],
  ['Kopersportaal', '/kopersportaal'],
  ['Mail', '/mail'],
  ['Planning', '/planning'],
  ['Projecten', '/projecten'],
  ['Projectportaal', '/projectportaal'],
  ['Instellingen', '/instellingen']
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-lg border-b">
        SterkBouw
      </div>

      <nav className="flex flex-col p-2 gap-1">
        {MENU.map(([label, path]) => (
          <Link
            key={path}
            href={path}
            className={`px-4 py-2 rounded text-sm transition ${
              router.pathname.startsWith(path)
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
