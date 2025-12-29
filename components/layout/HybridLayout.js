// src/layouts/HybridLayout.js
'use client'

import { usePathname } from 'next/navigation' // App Router
// OF import { useRouter } from 'next/router' // Pages Router

export default function HybridLayout({ children }) {
  const pathname = usePathname?.() // App Router
  // const router = useRouter?.() // Pages Router
  
  return (
    <div className="hybrid-layout">
      {/* Header die in beide werkt */}
      <header className="bg-blue-600 text-white p-4">
        <h1>Sterkbouw - Hybride Systeem</h1>
        <p>Path: {pathname || window.location.pathname}</p>
      </header>
      
      <main className="p-4">
        {children}
      </main>
      
      {/* Navigation die naar beide routers kan */}
      <nav className="p-4 bg-gray-100">
        <a href="/dashboard" className="mr-4">Dashboard (Pages)</a>
        <a href="/calculaties/nieuw" className="mr-4">Calculatie (App)</a>
        <a href="/bim" className="mr-4">BIM (App)</a>
      </nav>
    </div>
  )
}
