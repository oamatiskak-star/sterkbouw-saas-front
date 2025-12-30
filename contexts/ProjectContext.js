mport React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
const [projects, setProjects] = useState([]);
const [activeProject, setActiveProject] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const fetchProjects = useCallback(async () => {
setIsLoading(true);
try {
// Mock API call
const mockProjects = [
{ id: 1, name: 'Brug Renovatie', status: 'active', location: 'Amsterdam' },
{ id: 2, name: 'Tunnel Inspectie', status: 'planned', location: 'Rotterdam' },
];
setProjects(mockProjects);
} catch (error) {
toast.error('Fout bij laden projecten');
} finally {
setIsLoading(false);
}
}, []);

const selectProject = useCallback((project) => {
setActiveProject(project);
localStorage.setItem('activeProject', JSON.stringify(project));
}, []);

const updateProjectStatus = useCallback((projectId, status) => {
setProjects(prev => prev.map(p =>
p.id === projectId ? { ...p, status } : p
));
if (activeProject?.id === projectId) {
setActiveProject(prev => ({ ...prev, status }));
}
}, [activeProject]);

return (
<ProjectContext.Provider value={{
projects,
activeProject,
isLoading,
fetchProjects,
selectProject,
updateProjectStatus,
}}>
{children}
</ProjectContext.Provider>
);
};

export const useProject = () => {
const context = useContext(ProjectContext);
if (!context) throw new Error('useProject must be used within ProjectProvider');
return context;
};
