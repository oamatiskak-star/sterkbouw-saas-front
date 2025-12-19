import { createContext, useContext, useEffect, useState } from "react"

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("active_project_id")
    if (stored) {
      setProjectId(stored)
    }
  }, [])

  function selectProject(id) {
    setProjectId(id)
    if (typeof window !== "undefined") {
      localStorage.setItem("active_project_id", id)
    }
  }

  function clearProject() {
    setProjectId(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("active_project_id")
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        selectProject,
        clearProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  return useContext(ProjectContext)
}
