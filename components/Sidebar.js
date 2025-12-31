// components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/dashboard' },
  { name: 'Administratie', icon: '📋', path: '/administration' },
  { name: 'BIM', icon: '🏢', path: '/bim' },
  { name: 'Bouwplaats', icon: '🚧', path: '/bouwplaats' },
  { name: 'Calculatie', icon: '🧮', path: '/calculatie' },
  { name: 'Constructie', icon: '⚙️', path: '/constructie' },
  { name: 'Documenten', icon: '📄', path: '/documenten' },
  { name: 'Financiën', icon: '💶', path: '/financien' },
  { name: 'Financieringen', icon: '🏦', path: '/financieringen' },
  { name: 'Inkoop', icon: '📦', path: '/inkoop' },
  { name: 'Kopersportaal', icon: '👥', path: '/kopersportaal' },
  { name: 'Mail', icon: '✉️', path: '/mail' },
  { name: 'Planning', icon: '📅', path: '/planning' },
  { name: 'Projecten', icon: '📁', path: '/projecten' },
  { name: 'Projectportaal', icon: '👨‍💼', path: '/projectportaal' },
  { name: 'Instellingen', icon: '⚙️', path: '/instellingen' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">SterkBouw</h1>
      </div>

      {/* Menu */}
      <nav className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Hoofdmenu
          </h2>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
