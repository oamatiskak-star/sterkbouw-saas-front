import React, { createContext, useState, useContext, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for initial development
  useEffect(() => {
    // Replace this with actual API call
    const mockProjects = [
      {
        id: 1,
        name: 'Project A',
        location: 'Amsterdam',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        budget: 500000
      },
      {
        id: 2,
        name: 'Project B',
        location: 'Rotterdam',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        status: 'planning',
        budget: 750000
      }
    ];
    
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: projects.length + 1
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id, updatedData) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updatedData } : project
    ));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const selectProject = (project) => {
    setSelectedProject(project);
  };

  const value = {
    projects,
    selectedProject,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    selectProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
