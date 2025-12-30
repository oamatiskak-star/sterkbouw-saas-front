import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Breadcrumbs() {
  const router = useRouter()
  const parts = router.pathname.split('/').filter(Boolean)

  return (
    <div className="bg-gray-50 border-b px-6 py-2 text-sm">
      <div className="flex gap-2">
        <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
        {parts.map((part, i) => {
          const path = '/' + parts.slice(0, i + 1).join('/')
          return (
            <span key={path} className="flex gap-2">
              <span>/</span>
              <Link href={path} className="text-blue-600 capitalize">
                {part}
              </Link>
            </span>
          )
        })}
      </div>
    </div>
  )
}
