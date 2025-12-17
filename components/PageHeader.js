import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function PageHeader({ title, submoduleKey, role = "admin" }) {
const [actions, setActions] = useState([])

useEffect(() => {
if (!submoduleKey) return

fetch(`${API}/api/actions/${submoduleKey}`, {
  headers: {
    "x-role": role
  }
})
  .then(r => r.json())
  .then(data => {
    setActions(Array.isArray(data) ? data : [])
  })
  .catch(() => {
    setActions([])
  })


}, [submoduleKey, role])

return (
<div className="page-header d-flex justify-content-between align-items-center mb-4">
<h1 className="page-title">{title}</h1>

  <div className="btn-list">
    {actions.map(action => (
      <button
        key={action.key}
        className="btn btn-primary"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("sb-action", {
              detail: action.key
            })
          )
        }}
      >
        {action.icon && <i className={`ti ti-${action.icon} me-1`}></i>}
        {action.label}
      </button>
    ))}
  </div>
</div>


)
}
