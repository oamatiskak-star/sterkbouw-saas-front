// src/components/layout/dashboard-layout.tsx
"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { MobileSidebar } from "./mobile-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  actions,
  breadcrumbs 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <Navbar 
          title={title} 
          description={description}
          actions={actions}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
