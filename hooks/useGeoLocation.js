import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null
  });

  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const handleSuccess = (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          error: null
        });
      };

      const handleError = (error) => {
        setLocation(prev => ({
          ...prev,
          error: error.message
        }));
      };

      if (watching) {
        const watchId = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      }
    } else {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation wordt niet ondersteund door deze browser'
      }));
    }
  }, [watching]);

  const startWatching = () => {
    if ('geolocation' in navigator) {
      setWatching(true);
      return true;
    }
    return false;
  };

  const stopWatching = () => {
    setWatching(false);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              error: null
            });
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            setLocation(prev => ({
              ...prev,
              error: error.message
            }));
            reject(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        );
      } else {
        const error = 'Geolocation wordt niet ondersteund door deze browser';
        setLocation(prev => ({ ...prev, error }));
        reject(new Error(error));
      }
    });
  };

  return {
    ...location,
    watching,
    startWatching,
    stopWatching,
    getCurrentLocation,
    hasLocation: location.latitude !== null && location.longitude !== null
  };
};
