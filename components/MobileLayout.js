import Link from "next/link"

export default function MobileLayout({ children }) {
  return (
    <div className="sb-mobile">
      <main className="sb-mobile-content">
        {children}
      </main>

      <nav className="sb-mobile-nav">
        <Link href="/dashboard">🏠</Link>
        <Link href="/taken">📋</Link>
        <Link href="/calculaties/bouw">🧮</Link>
        <Link href="/uploads">📎</Link>
        <Link href="/account">👤</Link>
      </nav>
    </div>
  )
}
