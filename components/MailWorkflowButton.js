import { useEffect, useState } from "react"
import { canRunMailWorkflow } from "../lib/mailWorkflowPermissions"

export default function MailWorkflowButton({
  userId,
  workflowKey,
  label,
  onRun
}) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      const ok = await canRunMailWorkflow(userId, workflowKey)
      setAllowed(ok)
    }
    check()
  }, [userId, workflowKey])

  if (!allowed) return null

  return (
    <button
      className="btn btn-outline-primary"
      onClick={onRun}
    >
      {label}
    </button>
  )
}
