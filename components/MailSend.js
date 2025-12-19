import { useState } from "react"

export default function MailSend({ accounts, workflowKey, projectId }) {
  const [accountId, setAccountId] = useState("")

  if (!workflowKey || !projectId) return null

  return (
    <form method="POST" action="/api/mail/send">
      <input type="hidden" name="workflow_key" value={workflowKey} />
      <input type="hidden" name="project_id" value={projectId} />

      <div className="mb-3">
        <label>Afzender</label>
        <select
          className="form-select"
          required
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          name="mail_account_id"
        >
          <option value="">Selecteer account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" disabled={!accountId}>
        Versturen
      </button>
    </form>
  )
}
