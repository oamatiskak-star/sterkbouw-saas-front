import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export const useBIMViewer = (initialModel = null) => {
const [viewer, setViewer] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [viewerState, setViewerState] = useState({
zoom: 1,
rotation: { x: 0, y: 0, z: 0 },
position: { x: 0, y: 0, z: 0 },
selectedElements: [],
clipPlanes: [],
});
const viewerRef = useRef(null);

const initializeViewer = useCallback((containerId, options = {}) => {
setIsLoading(true);
try {
// Mock viewer initialization
const mockViewer = {
container: containerId,
loadModel: (url) => {
console.log('Loading model:', url);
return new Promise(resolve => {
setTimeout(() => {
setIsLoading(false);
toast.success('Model geladen');
resolve({ success: true });
}, 1500);
});
},
setBackgroundColor: (color) => {
console.log('Background color:', color);
},
fitToView: () => {
console.log('Fitting to view');
},
isolateElements: (elements) => {
setViewerState(prev => ({ ...prev, selectedElements: elements }));
},
getScreenShot: () => {
return data:image/png;base64,mock_screenshot_${Date.now()};
},
};

text
  setViewer(mockViewer);
  viewerRef.current = mockViewer;
  return mockViewer;
} catch (error) {
  setIsLoading(false);
  toast.error('Viewer initialisatie mislukt');
  throw error;
}
}, []);

const loadModel = useCallback(async (modelUrl) => {
if (!viewerRef.current) return null;

text
setIsLoading(true);
try {
  const result = await viewerRef.current.loadModel(modelUrl);
  return result;
} catch (error) {
  toast.error('Model laden mislukt');
  return null;
} finally {
  setIsLoading(false);
}
}, []);

const takeScreenshot = useCallback((filename = 'screenshot') => {
if (!viewerRef.current) return null;

text
const screenshot = viewerRef.current.getScreenShot();
// Create download link
const link = document.createElement('a');
link.href = screenshot;
link.download = `${filename}_${Date.now()}.png`;
link.click();

toast.success('Screenshot opgeslagen');
return screenshot;
}, []);

const measureDistance = useCallback((point1, point2) => {
const dx = point2.x - point1.x;
const dy = point2.y - point1.y;
const dz = point2.z - point1.z;
const distance = Math.sqrt(dxdx + dydy + dz*dz);

text
toast.info(`Afstand: ${distance.toFixed(2)}m`);
return distance;
}, []);

const setClipPlane = useCallback((normal, constant) => {
if (!viewerRef.current) return;

text
setViewerState(prev => ({
  ...prev,
  clipPlanes: [...prev.clipPlanes, { normal, constant }],
}));

toast.info('Clip plane toegevoegd');
}, []);

const resetView = useCallback(() => {
setViewerState({
zoom: 1,
rotation: { x: 0, y: 0, z: 0 },
position: { x: 0, y: 0, z: 0 },
selectedElements: [],
clipPlanes: [],
});

text
if (viewerRef.current?.fitToView) {
  viewerRef.current.fitToView();
}

toast.info('View gereset');
}, []);

return {
viewer,
isLoading,
viewerState,
initializeViewer,
loadModel,
takeScreenshot,
measureDistance,
setClipPlane,
resetView,
};
};

