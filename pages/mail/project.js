// pages/mail/project.js
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function MailProject() {
  const router = useRouter()
  const { projectId } = router.query
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Mail project laden...</div>
  }

  return (
    <div>
      <h1>Mail project {projectId || ''}</h1>
      <p>Mail functionaliteit voor project {projectId}</p>
    </div>
  )
}
