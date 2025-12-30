import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuleer project data
    const mockProjects = [
      {
        id: 1,
        name: 'Woningbouw Amsterdam Noord',
        status: 'active',
        budget: 2500000,
        progress: 65
      },
      {
        id: 2,
        name: 'Kantoorrenovatie Rotterdam',
        status: 'active',
        budget: 1200000,
        progress: 40
      },
      {
        id: 3,
        name: 'Project Havenkwartier',
        status: 'planned',
        budget: 3500000,
        progress: 15
      }
    ];

    setProjects(mockProjects);
    setCurrentProject(mockProjects[0]);
    setLoading(false);
  }, []);

  const value = {
    projects,
    currentProject,
    loading,
    setCurrentProject,
    addProject: (project) => {
      setProjects([...projects, { ...project, id: projects.length + 1 }]);
    },
    updateProject: (id, updates) => {
      setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
