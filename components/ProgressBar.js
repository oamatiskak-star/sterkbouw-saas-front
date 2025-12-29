// components/ProgressBar.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ProgressBar() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleStart = () => {
      setShow(true)
      setProgress(30)
    }
    
    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setShow(false)
        setProgress(0)
      }, 300)
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

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div 
        className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="h-1 bg-gray-200"></div>
    </div>
  )
}
