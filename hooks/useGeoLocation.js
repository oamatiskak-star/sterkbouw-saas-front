import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useGeoLocation = (options = {}) => {
const [location, setLocation] = useState(null);
const [error, setError] = useState(null);
const [isTracking, setIsTracking] = useState(false);
const [watchId, setWatchId] = useState(null);
const [locationsHistory, setLocationsHistory] = useState([]);

const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options;

const getCurrentLocation = useCallback(() => {
return new Promise((resolve, reject) => {
if (!navigator.geolocation) {
const err = 'Geolocation niet ondersteund';
setError(err);
reject(err);
return;
}

text
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
      
      setLocation(newLocation);
      setError(null);
      setLocationsHistory(prev => [...prev, newLocation]);
      resolve(newLocation);
    },
    (error) => {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      toast.error(`Locatie fout: ${errorMessage}`);
      reject(error);
    },
    { enableHighAccuracy, timeout, maximumAge }
  );
});
}, [enableHighAccuracy, timeout, maximumAge]);

const startTracking = useCallback(() => {
if (watchId || !navigator.geolocation) return;

text
const id = navigator.geolocation.watchPosition(
  (position) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    
    setLocation(newLocation);
    setError(null);
    setLocationsHistory(prev => [...prev.slice(-49), newLocation]); // Keep last 50
  },
  (error) => {
    setError(getErrorMessage(error.code));
  },
  { enableHighAccuracy, timeout, maximumAge }
);

setWatchId(id);
setIsTracking(true);
toast.info('Locatie tracking gestart');
}, [watchId, enableHighAccuracy, timeout, maximumAge]);

const stopTracking = useCallback(() => {
if (watchId) {
navigator.geolocation.clearWatch(watchId);
setWatchId(null);
setIsTracking(false);
toast.info('Locatie tracking gestopt');
}
}, [watchId]);

const getErrorMessage = (code) => {
switch (code) {
case 1: return 'Geen toestemming';
case 2: return 'Positie niet beschikbaar';
case 3: return 'Timeout';
default: return 'Onbekende fout';
}
};

useEffect(() => {
return () => {
if (watchId) {
navigator.geolocation.clearWatch(watchId);
}
};
}, [watchId]);

return {
location,
error,
isTracking,
locationsHistory,
getCurrentLocation,
startTracking,
stopTracking,
};
};
