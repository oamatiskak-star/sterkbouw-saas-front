import React, { createContext, useContext, useState, useCallback } from 'react';

const BIMContext = createContext();

export const BIMProvider = ({ children }) => {
const [models, setModels] = useState([]);
const [activeModel, setActiveModel] = useState(null);
const [viewerSettings, setViewerSettings] = useState({
showGrid: true,
showAxes: false,
backgroundColor: '#FFFFFF',
quality: 'medium',
});
const [measurements, setMeasurements] = useState([]);
const [viewpoints, setViewpoints] = useState([]);

const loadModel = useCallback(async (modelId) => {
try {
// Mock model loading
const mockModel = {
id: modelId,
name: 'Bridge_Model_2024',
elements: 12543,
size: '245 MB',
version: '2.1.4',
};
setActiveModel(mockModel);
return mockModel;
} catch (error) {
console.error('Model loading failed:', error);
return null;
}
}, []);

const takeMeasurement = useCallback((start, end) => {
const newMeasurement = {
id: Date.now(),
start,
end,
distance: calculateDistance(start, end),
timestamp: new Date().toISOString(),
};
setMeasurements(prev => [...prev, newMeasurement]);
return newMeasurement;
}, []);

const saveViewpoint = useCallback((cameraPosition, name) => {
const newViewpoint = {
id: Date.now(),
name: name || Viewpoint_${Date.now()},
cameraPosition,
timestamp: new Date().toISOString(),
};
setViewpoints(prev => [...prev, newViewpoint]);
return newViewpoint;
}, []);

const updateViewerSettings = useCallback((newSettings) => {
setViewerSettings(prev => ({ ...prev, ...newSettings }));
}, []);

return (
<BIMContext.Provider value={{
models,
activeModel,
viewerSettings,
measurements,
viewpoints,
loadModel,
takeMeasurement,
saveViewpoint,
updateViewerSettings,
}}>
{children}
</BIMContext.Provider>
);
};

const calculateDistance = (start, end) => {
// Simplified distance calculation
const dx = end.x - start.x;
const dy = end.y - start.y;
const dz = end.z - start.z;
return Math.sqrt(dxdx + dydy + dz*dz).toFixed(2);
};

export const useBIM = () => {
const context = useContext(BIMContext);
if (!context) throw new Error('useBIM must be used within BIMProvider');
return context;
};
