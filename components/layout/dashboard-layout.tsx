// components/layout/dashboard-layout.tsx
import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, title, actions }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} actions={actions} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
