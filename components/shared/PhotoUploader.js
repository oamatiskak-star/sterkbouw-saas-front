import React, { useState, useRef } from 'react';
import { Camera, MapPin, X } from 'lucide-react';
import { uploadToS3 } from '../../lib/aws';
import { toast } from '../ui/Toast';

const PhotoUploader = ({ onUpload, maxPhotos = 10 }) => {
const [photos, setPhotos] = useState([]);
const [isCapturing, setIsCapturing] = useState(false);
const fileInputRef = useRef();

const capturePhoto = async () => {
setIsCapturing(true);
try {
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const video = document.createElement('video');
video.srcObject = stream;
await video.play();

text
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  stream.getTracks().forEach(track => track.stop());

  canvas.toBlob(async (blob) => {
    const location = await getCurrentLocation();
    const photo = {
      id: Date.now(),
      url: URL.createObjectURL(blob),
      timestamp: new Date().toISOString(),
      location,
      file: blob
    };
    setPhotos([...photos, photo]);
    onUpload?.(photo);
  }, 'image/jpeg');
} catch (error) {
  toast.error('Camera access denied');
} finally {
  setIsCapturing(false);
}
};

const getCurrentLocation = () => {
return new Promise((resolve) => {
if (!navigator.geolocation) {
resolve(null);
return;
}
navigator.geolocation.getCurrentPosition(
(pos) => resolve({
lat: pos.coords.latitude,
lng: pos.coords.longitude,
accuracy: pos.coords.accuracy
}),
() => resolve(null)
);
});
};

const uploadPhotos = async () => {
for (const photo of photos) {
const key = await uploadToS3(photo.file, 'inspections/photos');
photo.s3Key = key;
}
toast.success('Photos uploaded successfully');
};

return (
<div className="space-y-4">
<div className="flex gap-4">
<button onClick={capturePhoto} disabled={isCapturing || photos.length >= maxPhotos}>
<Camera /> {isCapturing ? 'Capturing...' : 'Capture Photo'}
</button>
<input type="file" accept="image/*" ref={fileInputRef} multiple className="hidden" />
</div>

text
  <div className="grid grid-cols-3 gap-4">
    {photos.map(photo => (
      <div key={photo.id} className="relative">
        <img src={photo.url} alt="Capture" className="rounded-lg" />
        {photo.location && (
          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white p-1 rounded">
            <MapPin size={12} /> GPS
          </div>
        )}
        <button onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}>
          <X size={16} />
        </button>
      </div>
    ))}
  </div>

  {photos.length > 0 && (
    <button onClick={uploadPhotos} className="btn-primary">
      Upload {photos.length} Photos
    </button>
  )}
</div>
);
};

export default PhotoUploader;
