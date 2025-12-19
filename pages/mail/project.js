import MailWorkflowActions from "../../components/MailWorkflowActions"
import { useProject } from "../../components/ProjectContext"

export default function ProjectMail({ session }) {
  const { projectId } = useProject()

  const actions = [
    {
      workflow_key: "mail_project_update",
      label: "Stuur projectupdate",
      onRun: () => {
        fetch("/api/mail/workflow", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "mail_project_update",
            project_id: projectId
          })
        })
      }
    },
    {
      workflow_key: "mail_project_factuur",
      label: "Stuur factuur",
      onRun: () => {
        fetch("/api/mail/workflow", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "mail_project_factuur",
            project_id: projectId
          })
        })
      }
    }
  ]

  return (
    <div>
      <h1>Projectmail</h1>

      <MailWorkflowActions
        userId={session.user.id}
        actions={actions}
      />
    </div>
  )
}
