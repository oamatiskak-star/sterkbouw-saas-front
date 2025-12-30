import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useOfflineSync = (queueName = 'default') => {
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [queue, setQueue] = useState(() => {
const saved = localStorage.getItem(syncQueue_${queueName});
return saved ? JSON.parse(saved) : [];
});
const [isSyncing, setIsSyncing] = useState(false);
const [lastSync, setLastSync] = useState(null);

// Network status listener
useEffect(() => {
const handleOnline = () => {
setIsOnline(true);
toast.success('Online - synchroniseren...');
processQueue();
};

text
const handleOffline = () => {
  setIsOnline(false);
  toast.warning('Offline - wijzigingen worden opgeslagen lokaal');
};

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

return () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};
}, []);

// Save queue to localStorage whenever it changes
useEffect(() => {
localStorage.setItem(syncQueue_${queueName}, JSON.stringify(queue));
}, [queue, queueName]);

const addToQueue = useCallback((action, data, retryCount = 0) => {
const queueItem = {
id: Date.now() + Math.random(),
action,
data,
retryCount,
createdAt: new Date().toISOString(),
status: 'pending',
};

text
setQueue(prev => [...prev, queueItem]);
toast.info('Wijziging toegevoegd aan wachtrij');

// Try to process immediately if online
if (isOnline) {
  processQueue();
}

return queueItem.id;
}, [isOnline]);

const processQueue = useCallback(async () => {
if (!isOnline || isSyncing || queue.length === 0) return;

text
setIsSyncing(true);
const itemsToProcess = [...queue].filter(item => item.status === 'pending');

for (const item of itemsToProcess) {
  try {
    // Mock API call - replace with actual API
    console.log('Processing:', item.action, item.data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mark as completed
    setQueue(prev => prev.map(q => 
      q.id === item.id ? { ...q, status: 'completed' } : q
    ));
    
  } catch (error) {
    console.error('Sync failed:', error);
    
    if (item.retryCount < 3) {
      // Retry
      setQueue(prev => prev.map(q => 
        q.id === item.id 
          ? { ...q, retryCount: q.retryCount + 1 }
          : q
      ));
    } else {
      // Mark as failed
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'failed' } : q
      ));
      toast.error(`Item synchronisatie mislukt: ${item.action}`);
    }
  }
}

setLastSync(new Date().toISOString());
setIsSyncing(false);

// Cleanup completed items after 1 hour
setTimeout(() => {
  setQueue(prev => prev.filter(item => 
    item.status !== 'completed' || 
    new Date(item.createdAt) > new Date(Date.now() - 3600000)
  ));
}, 3600000);
}, [isOnline, isSyncing, queue]);

const clearQueue = useCallback(() => {
setQueue([]);
localStorage.removeItem(syncQueue_${queueName});
toast.info('Wachtrij geleegd');
}, [queueName]);

const getQueueStats = useCallback(() => {
const pending = queue.filter(item => item.status === 'pending').length;
const failed = queue.filter(item => item.status === 'failed').length;
const completed = queue.filter(item => item.status === 'completed').length;

text
return { pending, failed, completed, total: queue.length };
}, [queue]);

return {
isOnline,
isSyncing,
lastSync,
queue,
addToQueue,
processQueue,
clearQueue,
getQueueStats,
};
};

