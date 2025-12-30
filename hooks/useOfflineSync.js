import { useState, useEffect, useCallback } from 'react';

export const useOfflineSync = (initialQueue = []) => {
  const [queue, setQueue] = useState(initialQueue);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Controleer online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Voeg item toe aan sync queue
  const addToQueue = useCallback((item) => {
    setQueue(prev => [...prev, {
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    }]);
  }, []);

  // Verwijder item uit queue
  const removeFromQueue = useCallback((id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update item status
  const updateItemStatus = useCallback((id, status, error = null) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status, error } : item
    ));
  }, []);

  // Simuleer sync proces
  const syncQueue = useCallback(async () => {
    if (queue.length === 0 || isSyncing || !isOnline) return;

    setIsSyncing(true);
    const pendingItems = queue.filter(item => item.status === 'pending');

    try {
      for (const item of pendingItems) {
        updateItemStatus(item.id, 'syncing');
        
        // Simuleer API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Random kans op succes/failure voor demo
        const success = Math.random() > 0.2;
        
        if (success) {
          updateItemStatus(item.id, 'synced');
          // Verwijder succesvol gesynced items na 5 seconden
          setTimeout(() => removeFromQueue(item.id), 5000);
        } else {
          updateItemStatus(item.id, 'failed', 'Sync mislukt');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [queue, isOnline, isSyncing, updateItemStatus, removeFromQueue]);

  // Automatisch sync wanneer online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const interval = setInterval(syncQueue, 10000); // Sync elke 10 seconden
      return () => clearInterval(interval);
    }
  }, [isOnline, queue.length, syncQueue]);

  // Handmatige sync trigger
  const manualSync = useCallback(() => {
    if (isOnline && !isSyncing) {
      syncQueue();
    }
  }, [isOnline, isSyncing, syncQueue]);

  return {
    queue,
    isOnline,
    isSyncing,
    pendingItems: queue.filter(item => item.status === 'pending'),
    syncedItems: queue.filter(item => item.status === 'synced'),
    failedItems: queue.filter(item => item.status === 'failed'),
    addToQueue,
    removeFromQueue,
    updateItemStatus,
    manualSync,
    retryItem: (id) => {
      updateItemStatus(id, 'pending');
      if (isOnline) manualSync();
    }
  };
};
