// components/ProgressBar.js - ZONDER NPROGRESS
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ProgressBar() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleStart = () => setProgress(30)
    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => setProgress(0), 300)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
