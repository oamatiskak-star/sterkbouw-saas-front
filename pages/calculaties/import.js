import WorkflowUpload from "../../components/WorkflowUpload"

export default function CalculatieImport() {
  const projectId = "active-project-id" // komt uit context
  const workflowKey = "calculatie_import"

  return (
    <div>
      <h1>Importeer calculatie bestanden</h1>

      <WorkflowUpload
        workflowKey={workflowKey}
        projectId={projectId}
      />
    </div>
  )
}
