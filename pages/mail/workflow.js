// pages/mail/workflow.js
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function MailWorkflow() {
  const router = useRouter()
  const { workflowId } = router.query
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Mail workflow laden...</div>
  }

  return (
    <div>
      <h1>Mail workflow {workflowId || ''}</h1>
      <p>Workflow mail functionaliteit</p>
    </div>
  )
}
