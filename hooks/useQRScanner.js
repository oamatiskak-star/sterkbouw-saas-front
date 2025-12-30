import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BrowserQRCodeReader } from '@zxing/browser';

export const useQRScanner = (options = {}) => {
const [isScanning, setIsScanning] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState(null);
const [hasPermission, setHasPermission] = useState(null);
const [deviceId, setDeviceId] = useState(null);
const codeReader = useRef(null);

const {
facingMode = 'environment',
torch = false,
continuous = true,
} = options;

const checkCameraPermission = useCallback(async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
stream.getTracks().forEach(track => track.stop());
setHasPermission(true);
return true;
} catch (err) {
setHasPermission(false);
setError('Camera toestemming vereist');
return false;
}
}, []);

const getVideoDevices = useCallback(async () => {
try {
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter(device => device.kind === 'videoinput');
return videoDevices;
} catch (err) {
console.error('Error getting devices:', err);
return [];
}
}, []);

const startScanning = useCallback(async (videoElement) => {
if (!videoElement || !hasPermission) return;

text
setIsScanning(true);
setError(null);

try {
  // Initialize code reader
  codeReader.current = new BrowserQRCodeReader();
  
  // Get available devices
  const videoDevices = await getVideoDevices();
  if (videoDevices.length === 0) {
    throw new Error('Geen camera gevonden');
  }
  
  // Try to find back camera first
  let selectedDeviceId = deviceId;
  if (!selectedDeviceId && facingMode === 'environment') {
    const backCamera = videoDevices.find(device => 
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear')
    );
    if (backCamera) {
      selectedDeviceId = backCamera.deviceId;
      setDeviceId(backCamera.deviceId);
    }
  }
  
  // Start decoding
  const controls = await codeReader.current.decodeFromVideoDevice(
    selectedDeviceId || undefined,
    videoElement,
    (result, error) => {
      if (result) {
        handleScanResult(result);
      }
      if (error && !(error instanceof BrowserQRCodeReader.NotFoundException)) {
        console.error('Scan error:', error);
      }
    }
  );
  
  // Store controls for later cleanup
  codeReader.current.controls = controls;
  
  toast.success('Scanner gestart');
} catch (err) {
  setError(err.message);
  setIsScanning(false);
  toast.error('Scanner starten mislukt');
}
}, [hasPermission, deviceId, facingMode, getVideoDevices]);

const stopScanning = useCallback(() => {
if (codeReader.current && codeReader.current.controls) {
codeReader.current.controls.stop();
codeReader.current = null;
}
setIsScanning(false);
toast.info('Scanner gestopt');
}, []);

const handleScanResult = useCallback((scanResult) => {
const text = scanResult.getText();
setResult({
text,
raw: scanResult,
timestamp: new Date().toISOString(),
});

text
toast.success('Code gescand!');

if (!continuous) {
  stopScanning();
}

// Vibrate if available
if (navigator.vibrate) {
  navigator.vibrate(200);
}
}, [continuous, stopScanning]);

const generateQRCode = useCallback((data, size = 256) => {
// This would typically use a QR code library
// For now, return a mock data URL
const mockQR = data:image/svg+xml;base64,${btoa(
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="white"/>
<text x="50%" y="50%" text-anchor="middle" dy=".3em">QR: ${data.substring(0, 20)}...</text>
</svg>
)};

text
return mockQR;
}, []);

useEffect(() => {
checkCameraPermission();

text
return () => {
  if (codeReader.current) {
    stopScanning();
  }
};
}, [checkCameraPermission, stopScanning]);

return {
isScanning,
result,
error,
hasPermission,
startScanning,
stopScanning,
generateQRCode,
checkCameraPermission,
};
};
