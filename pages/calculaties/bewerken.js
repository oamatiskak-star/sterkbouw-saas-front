import WorkflowActions from "../../components/WorkflowActions"
import { useProject } from "../../components/ProjectContext"

export default function CalculatieBewerken({ session }) {
  const { projectId } = useProject()

  const actions = [
    {
      workflow_key: "calculatie_optimaliseren",
      label: "Optimaliseren",
      onRun: () => {
        fetch("/api/workflow/run", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "calculatie_optimaliseren",
            project_id: projectId
          })
        })
      }
    },
    {
      workflow_key: "calculatie_fixeren",
      label: "Zet vast als Fixed Price",
      onRun: () => {
        fetch("/api/workflow/run", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "calculatie_fixeren",
            project_id: projectId
          })
        })
      }
    }
  ]

  return (
    <div>
      <h1>Calculatie bewerken</h1>

      <WorkflowActions
        userId={session.user.id}
        actions={actions}
      />
    </div>
  )
}
