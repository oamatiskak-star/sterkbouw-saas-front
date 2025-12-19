import { useProject } from "../../components/ProjectContext"

export default function ProjectenLanding() {
  const { selectProject } = useProject()

  function handleSelect(id) {
    selectProject(id)
  }

  return (
    <div>
      <h1>Projecten</h1>

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary"
          onClick={() => handleSelect("project-1")}
        >
          Project 1
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => handleSelect("project-2")}
        >
          Project 2
        </button>
      </div>
    </div>
  )
}
