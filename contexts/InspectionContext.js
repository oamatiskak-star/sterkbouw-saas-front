import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const InspectionContext = createContext();

export const InspectionProvider = ({ children }) => {
const [inspections, setInspections] = useState([]);
const [activeInspection, setActiveInspection] = useState(null);
const [draft, setDraft] = useState(null);
const [isSyncing, setIsSyncing] = useState(false);

const fetchInspections = useCallback(async (projectId) => {
try {
// Mock API call
const mockInspections = [
{ id: 1, title: 'Brug pijler inspectie', status: 'completed', date: '2024-01-15' },
{ id: 2, title: 'Tunnel veiligheid', status: 'in_progress', date: '2024-01-16' },
];
setInspections(mockInspections);
return mockInspections;
} catch (error) {
toast.error('Fout bij laden inspecties');
return [];
}
}, []);

const startInspection = useCallback((template) => {
const newInspection = {
id: Date.now(),
...template,
startTime: new Date().toISOString(),
status: 'in_progress',
findings: [],
};
setActiveInspection(newInspection);
return newInspection;
}, []);

const addFinding = useCallback((finding) => {
if (!activeInspection) return;

text
const updatedInspection = {
  ...activeInspection,
  findings: [...activeInspection.findings, {
    ...finding,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  }],
};

setActiveInspection(updatedInspection);
setDraft(updatedInspection);
return updatedInspection;
}, [activeInspection]);

const completeInspection = useCallback(async () => {
if (!activeInspection) return;

text
setIsSyncing(true);
try {
  // Mock API call
  const completed = {
    ...activeInspection,
    endTime: new Date().toISOString(),
    status: 'completed',
  };
  
  setInspections(prev => [completed, ...prev]);
  setActiveInspection(null);
  setDraft(null);
  
  toast.success('Inspectie opgeslagen');
  return completed;
} catch (error) {
  toast.error('Opslaan mislukt');
  return null;
} finally {
  setIsSyncing(false);
}
}, [activeInspection]);

return (
<InspectionContext.Provider value={{
inspections,
activeInspection,
draft,
isSyncing,
fetchInspections,
startInspection,
addFinding,
completeInspection,
}}>
{children}
</InspectionContext.Provider>
);
};

export const useInspection = () => {
const context = useContext(InspectionContext);
if (!context) throw new Error('useInspection must be used within InspectionProvider');
return context;
};
