import { useState } from "react"
import Sidebar from "./Sidebar"
import MobileMenuTrigger from "./MobileMenuTrigger"

export default function LayoutShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="sb-layout">
      <MobileMenuTrigger onOpen={() => setMobileOpen(true)} />

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="sb-content">
        {children}
      </main>
    </div>
  )
}
