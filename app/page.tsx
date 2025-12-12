'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-xl font-semibold text-gray-700">
        Bezig met laden...
      </h1>
    </main>
  )
}
