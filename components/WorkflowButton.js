import { useEffect, useState } from "react"
import { canRunWorkflow } from "../lib/workflowPermissions"

export default function WorkflowButton({
  userId,
  workflowKey,
  label,
  onRun
}) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      const ok = await canRunWorkflow(userId, workflowKey)
      setAllowed(ok)
    }
    check()
  }, [userId, workflowKey])

  if (!allowed) return null

  return (
    <button
      className="btn btn-primary"
      onClick={onRun}
    >
      {label}
    </button>
  )
}
