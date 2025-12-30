// contexts/ProjectContext.js
import React, { createContext, useContext, useState, useCallback } from 'react'

const ProjectContext = createContext(null)

// eenvoudige fallback notifier (geen externe dependency)
function notifyError(message) {
  if (typeof window !== 'undefined') {
    console.error('[ProjectContext]', message)
  }
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      // Mock data (zoals origineel)
      const mockProjects = [
        { id: 1, name: 'Brug Renovatie', status: 'active', location: 'Amsterdam' },
        { id: 2, name: 'Tunnel Inspectie', status: 'planned', location: 'Rotterdam' },
      ]
      setProjects(mockProjects)
    } catch (error) {
      notifyError('Fout bij laden projecten')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectProject = useCallback((project) => {
    setActiveProject(project)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeProject', JSON.stringify(project))
    }
  }, [])

  const updateProjectStatus = useCallback(
    (projectId, status) => {
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? { ...p, status } : p))
      )

      if (activeProject?.id === projectId) {
        setActiveProject(prev => ({ ...prev, status }))
      }
    },
    [activeProject]
  )

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoading,
        fetchProjects,
        selectProject,
        updateProjectStatus,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}
