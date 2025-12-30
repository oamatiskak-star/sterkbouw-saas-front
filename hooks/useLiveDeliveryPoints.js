import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import api from '../../services/api';

export const useLiveDeliveryPoints = (projectId) => {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [buildingNumbers, setBuildingNumbers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { subscribe, unsubscribe } = useWebSocket();

  // Laad initiële data
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const [pointsRes, buildingsRes, spacesRes] = await Promise.all([
        api.get(`/delivery-points?projectId=${projectId}`),
        api.get(`/projects/${projectId}/building-numbers`),
        api.get(`/projects/${projectId}/spaces`)
      ]);
      
      setDeliveryPoints(pointsRes.data);
      setBuildingNumbers(buildingsRes.data);
      setSpaces(spacesRes.data);
    } catch (error) {
      console.error('Error loading delivery points:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // WebSocket voor realtime updates
  useEffect(() => {
    if (!projectId) return;

    const handleDeliveryPointUpdate = (data) => {
      if (data.projectId === projectId) {
        setDeliveryPoints(prev => {
          const index = prev.findIndex(dp => dp.id === data.id);
          if (index >= 0) {
            // Update bestaand punt
            const newPoints = [...prev];
            newPoints[index] = data;
            return newPoints;
          } else {
            // Voeg nieuw punt toe
            return [...prev, data];
          }
        });
      }
    };

    // Subscribe op updates
    subscribe(`project-${projectId}-delivery-points`, handleDeliveryPointUpdate);

    // Laad initiële data
    loadData();

    // Cleanup
    return () => {
      unsubscribe(`project-${projectId}-delivery-points`);
    };
  }, [projectId, loadData, subscribe, unsubscribe]);

  // Opleverrapport genereren
  const generateDeliveryReport = async (reportType) => {
    if (!projectId) return null;
    
    try {
      const response = await api.post('/documents/generate-delivery-report', {
        projectId,
        reportType,
        deliveryPoints,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };

  return {
    deliveryPoints,
    buildingNumbers,
    spaces,
    isLoading,
    refreshData: loadData,
    generateDeliveryReport
  };
};
