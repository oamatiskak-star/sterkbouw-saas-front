// components/core/CoreShell.tsx

import { ReactNode } from 'react'
import { getAppScopeFromHost } from '@/config/appScope'
import { dashboardMenu } from '@/config/menu.dashboard'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function CoreShell({
  children,
  host,
}: {
  children: ReactNode
  host: string
}) {
  const appScope = getAppScopeFromHost(host)

  if (appScope !== 'dashboard') {
    throw new Error('CoreShell V1 alleen dashboard actief')
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar menu={dashboardMenu} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
