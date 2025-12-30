// components/core/TopBar.tsx

import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export default function TopBar() {
  const { user, logout } = useContext(AuthContext)

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="font-semibold text-sm">
        Dashboard
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email}
        </span>
        <button
          onClick={logout}
          className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          Uitloggen
        </button>
      </div>
    </header>
  )
}
