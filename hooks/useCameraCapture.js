import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export const useCameraCapture = (options = {}) => {
const [photo, setPhoto] = useState(null);
const [isCapturing, setIsCapturing] = useState(false);
const [stream, setStream] = useState(null);
const [error, setError] = useState(null);
const videoRef = useRef(null);
const canvasRef = useRef(null);

const {
quality = 0.8,
maxWidth = 1920,
maxHeight = 1080,
facingMode = 'environment',
torch = false,
} = options;

const startCamera = useCallback(async () => {
try {
setError(null);

text
  const constraints = {
    video: {
      facingMode,
      width: { ideal: maxWidth },
      height: { ideal: maxHeight },
    },
  };

  if (torch) {
    constraints.video.torch = torch;
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  
  if (videoRef.current) {
    videoRef.current.srcObject = mediaStream;
    await videoRef.current.play();
  }
  
  setStream(mediaStream);
  toast.success('Camera gestart');
  return true;
} catch (err) {
  const errorMsg = getCameraError(err);
  setError(errorMsg);
  toast.error(`Camera fout: ${errorMsg}`);
  return false;
}
}, [facingMode, maxWidth, maxHeight, torch]);

const stopCamera = useCallback(() => {
if (stream) {
stream.getTracks().forEach(track => track.stop());
setStream(null);

text
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  
  toast.info('Camera gestopt');
}
}, [stream]);

const capturePhoto = useCallback(() => {
if (!videoRef.current || !stream) {
toast.error('Camera niet gestart');
return null;
}

text
setIsCapturing(true);

try {
  const video = videoRef.current;
  const canvas = canvasRef.current || document.createElement('canvas');
  
  // Set canvas dimensions to video dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get data URL
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  
  // Create photo object
  const newPhoto = {
    dataUrl,
    timestamp: new Date().toISOString(),
    metadata: {
      width: canvas.width,
      height: canvas.height,
      quality,
      facingMode,
    },
  };
  
  setPhoto(newPhoto);
  toast.success('Foto gemaakt!');
  
  // Vibrate if available
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
  
  return newPhoto;
} catch (err) {
  setError('Foto maken mislukt');
  toast.error('Foto maken mislukt');
  return null;
} finally {
  setIsCapturing(false);
}
}, [stream, quality, facingMode]);

const savePhoto = useCallback(async (filename = 'photo') => {
if (!photo) return false;

text
try {
  // Convert data URL to blob
  const response = await fetch(photo.dataUrl);
  const blob = await response.blob();
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${photo.timestamp.replace(/[:.]/g, '-')}.jpg`;
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(link.href);
  
  toast.success('Foto opgeslagen');
  return true;
} catch (err) {
  toast.error('Foto opslaan mislukt');
  return false;
}
}, [photo]);

const getCameraError = (error) => {
switch (error.name) {
case 'NotAllowedError':
return 'Geen toestemming voor camera';
case 'NotFoundError':
return 'Geen camera gevonden';
case 'NotReadableError':
return 'Camera niet beschikbaar';
case 'OverconstrainedError':
return 'Camera vereisten niet ondersteund';
default:
return 'Onbekende camera fout';
}
};

const switchCamera = useCallback(async () => {
if (!stream) return false;

text
// Get available devices
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter(device => device.kind === 'videoinput');

if (videoDevices.length < 2) {
  toast.warning('Geen tweede camera gevonden');
  return false;
}

// Find current device
const currentTrack = stream.getVideoTracks()[0];
const currentDevice = videoDevices.find(
  device => device.label === currentTrack.label
);

// Find next device
const currentIndex = videoDevices.findIndex(
  device => device.deviceId === currentDevice?.deviceId
);
const nextIndex = (currentIndex + 1) % videoDevices.length;
const nextDevice = videoDevices[nextIndex];

// Stop current stream
stopCamera();

// Start with new device
const success = await startCamera({
  ...options,
  deviceId: { exact: nextDevice.deviceId },
});

if (success) {
  toast.info(`Camera gewisseld naar ${nextDevice.label || 'onbekend'}`);
}

return success;
}, [stream, stopCamera, startCamera, options]);

useEffect(() => {
return () => {
stopCamera();
};
}, [stopCamera]);

return {
photo,
isCapturing,
error,
stream,
videoRef,
canvasRef,
startCamera,
stopCamera,
capturePhoto,
savePhoto,
switchCamera,
};
};

