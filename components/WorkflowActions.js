import WorkflowButton from "./WorkflowButton"

export default function WorkflowActions({ userId, actions }) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="d-flex gap-2">
      {actions.map(action => (
        <WorkflowButton
          key={action.workflow_key}
          userId={userId}
          workflowKey={action.workflow_key}
          label={action.label}
          onRun={action.onRun}
        />
      ))}
    </div>
  )
}
