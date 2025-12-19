import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const router = useRouter()
  const [projectId, setProjectId] = useState(null)

  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("active_project_id")
      : null

    if (stored) {
      setProjectId(stored)
    }
  }, [])

  useEffect(() => {
    if (!projectId && router.pathname !== "/projecten") {
      router.replace("/projecten")
    }
  }, [projectId, router.pathname])

  function selectProject(id) {
    setProjectId(id)
    if (typeof window !== "undefined") {
      localStorage.setItem("active_project_id", id)
    }
  }

  return (
    <ProjectContext.Provider value={{ projectId, selectProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  return useContext(ProjectContext)
}
