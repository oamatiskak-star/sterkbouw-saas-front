// components/core/Sidebar.tsx

import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Sidebar({ menu }: { menu: any[] }) {
  const router = useRouter()

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="px-4 py-4 font-bold text-lg border-b">
        SterkBouw
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menu.map(item => {
          const active = router.pathname.startsWith(item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded px-3 py-2 text-sm font-medium
                ${active
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3 text-xs text-gray-500">
        Status: <span className="text-green-600 font-semibold">Online</span>
      </div>
    </aside>
  )
}
