import { openDB } from 'idb';

export class SyncService {
constructor() {
this.dbName = 'constructiq-offline';
this.dbVersion = 3;
this.storeNames = {
PROJECTS: 'projects',
INSPECTIONS: 'inspections',
MATERIALS: 'materials',
PHOTOS: 'photos',
SYNC_QUEUE: 'sync_queue',
SYNC_LOGS: 'sync_logs'
};

text
this.db = null;
this.isOnline = navigator.onLine;
this.syncInProgress = false;
this.maxRetries = 3;
this.retryDelay = 5000; // 5 seconds

// Set up online/offline detection
window.addEventListener('online', () => this.handleOnline());
window.addEventListener('offline', () => this.handleOffline());

// Initialize database
this.initDB().catch(console.error);
}

async initDB() {
try {
this.db = await openDB(this.dbName, this.dbVersion, {
upgrade(db, oldVersion, newVersion, transaction) {
// Create object stores if they don't exist
if (!db.objectStoreNames.contains('projects')) {
const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
projectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
}

text
      if (!db.objectStoreNames.contains('inspections')) {
        const inspectionStore = db.createObjectStore('inspections', { keyPath: 'id' });
        inspectionStore.createIndex('projectId', 'projectId', { unique: false });
        inspectionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        inspectionStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('materials')) {
        const materialStore = db.createObjectStore('materials', { keyPath: 'id' });
        materialStore.createIndex('projectId', 'projectId', { unique: false });
        materialStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        materialStore.createIndex('deliveryDate', 'deliveryDate', { unique: false });
      }

      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
        photoStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        photoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        queueStore.createIndex('operation', 'operation', { unique: false });
        queueStore.createIndex('entityType', 'entityType', { unique: false });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('sync_logs')) {
        const logStore = db.createObjectStore('sync_logs', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
        logStore.createIndex('type', 'type', { unique: false });
      }
    }
  });

  console.log('IndexedDB initialized successfully');
  await this.logSyncEvent('info', 'Database initialized');
  
  // Check for pending sync operations
  if (this.isOnline) {
    setTimeout(() => this.processSyncQueue(), 1000);
  }
} catch (error) {
  console.error('Failed to initialize IndexedDB:', error);
  throw error;
}
}

async saveOffline(data, entityType, operation = 'create') {
try {
if (!this.db) {
await this.initDB();
}

text
  // Generate offline ID if not present
  if (!data.id || data.id.toString().startsWith('local_')) {
    data.id = `local_${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add sync metadata
  const record = {
    ...data,
    _offline: true,
    _operation: operation,
    _syncStatus: 'pending',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _retries: 0
  };

  // Save to appropriate store
  await this.db.put(this.storeNames[entityType.toUpperCase()], record);

  // Add to sync queue
  await this.addToSyncQueue(record, entityType, operation);

  await this.logSyncEvent('info', `${operation} queued for ${entityType}: ${record.id}`);
  
  return {
    success: true,
    localId: record.id,
    message: 'Saved offline. Will sync when online.'
  };
} catch (error) {
  console.error(`Failed to save ${entityType} offline:`, error);
  await this.logSyncEvent('error', `Failed to save ${entityType}: ${error.message}`);
  
  return {
    success: false,
    error: error.message
  };
}
}

async addToSyncQueue(record, entityType, operation) {
try {
const queueItem = {
entityType,
entityId: record.id,
operation,
data: record,
status: 'pending',
createdAt: new Date().toISOString(),
retries: 0,
lastAttempt: null,
error: null
};

text
  await this.db.add(this.storeNames.SYNC_QUEUE, queueItem);
} catch (error) {
  console.error('Failed to add to sync queue:', error);
  throw error;
}
}

async processSyncQueue() {
if (this.syncInProgress || !this.isOnline || !this.db) {
return;
}

text
this.syncInProgress = true;

try {
  await this.logSyncEvent('info', 'Starting sync queue processing');
  
  // Get pending items, ordered by creation date
  const pendingItems = await this.db.getAllFromIndex(
    this.storeNames.SYNC_QUEUE,
    'status',
    'pending'
  );

  // Also get failed items that haven't exceeded max retries
  const failedItems = await this.db.getAllFromIndex(
    this.storeNames.SYNC_QUEUE,
    'status',
    'failed'
  );

  const itemsToProcess = [...pendingItems, ...failedItems]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .filter(item => item.retries < this.maxRetries);

  if (itemsToProcess.length === 0) {
    await this.logSyncEvent('info', 'No items to sync');
    return;
  }

  await this.logSyncEvent('info', `Processing ${itemsToProcess.length} sync items`);

  // Process items in batches
  const batchSize = 10;
  for (let i = 0; i < itemsToProcess.length; i += batchSize) {
    const batch = itemsToProcess.slice(i, i + batchSize);
    await this.processBatch(batch);
  }

  await this.logSyncEvent('info', 'Sync queue processing completed');
} catch (error) {
  console.error('Error processing sync queue:', error);
  await this.logSyncEvent('error', `Sync processing failed: ${error.message}`);
} finally {
  this.syncInProgress = false;
  
  // Schedule next check if there might be more items
  setTimeout(() => this.processSyncQueue(), 30000); // Check again in 30 seconds
}
}

async processBatch(batch) {
const results = {
successful: [],
failed: []
};

text
for (const item of batch) {
  try {
    // Update item status to processing
    item.status = 'processing';
    item.lastAttempt = new Date().toISOString();
    await this.db.put(this.storeNames.SYNC_QUEUE, item);

    // Perform the actual sync operation
    const result = await this.performSyncOperation(item);
    
    if (result.success) {
      // Update entity sync status in its own store
      await this.updateEntitySyncStatus(item.entityType, item.entityId, 'synced');
      
      // Remove from sync queue
      await this.db.delete(this.storeNames.SYNC_QUEUE, item.id);
      
      results.successful.push(item);
      await this.logSyncEvent('info', `Synced ${item.entityType} ${item.entityId}`);
    } else {
      throw new Error(result.error || 'Sync operation failed');
    }
  } catch (error) {
    console.error(`Failed to sync item ${item.id}:`, error);
    
    // Update retry count and status
    item.retries += 1;
    item.status = item.retries >= this.maxRetries ? 'permanently_failed' : 'failed';
    item.error = error.message;
    await this.db.put(this.storeNames.SYNC_QUEUE, item);
    
    results.failed.push({ item, error: error.message });
    await this.logSyncEvent('error', `Failed to sync ${item.entityType} ${item.entityId}: ${error.message}`);
  }
}

return results;
}

async performSyncOperation(item) {
// This is a placeholder for actual API calls
// In a real implementation, you would call your backend API here

text
// Simulate API call with random success/failure
const shouldFail = Math.random() < 0.1; // 10% failure rate for testing

if (shouldFail) {
  throw new Error('Simulated API failure');
}

// Simulate network delay
await new Promise(resolve => setTimeout(resolve, 100));

return {
  success: true,
  serverId: `server_${item.entityId}`,
  timestamp: new Date().toISOString()
};
}

async updateEntitySyncStatus(entityType, entityId, status) {
try {
const storeName = this.storeNames[entityType.toUpperCase()];
const entity = await this.db.get(storeName, entityId);

text
  if (entity) {
    entity._syncStatus = status;
    entity._updatedAt = new Date().toISOString();
    await this.db.put(storeName, entity);
  }
} catch (error) {
  console.error(`Failed to update sync status for ${entityType} ${entityId}:`, error);
}
}

async getOfflineData(entityType, filters = {}) {
try {
if (!this.db) {
await this.initDB();
}

text
  const storeName = this.storeNames[entityType.toUpperCase()];
  let data = await this.db.getAll(storeName);

  // Apply filters
  if (filters.projectId) {
    data = data.filter(item => item.projectId === filters.projectId);
  }

  if (filters.syncStatus) {
    data = data.filter(item => item._syncStatus === filters.syncStatus);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    data = data.filter(item => new Date(item._createdAt) >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    data = data.filter(item => new Date(item._createdAt) <= end);
  }

  // Sort by creation date (newest first)
  data.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));

  return data;
} catch (error) {
  console.error(`Failed to get offline data for ${entityType}:`, error);
  throw error;
}
}

async getSyncStatus() {
try {
if (!this.db) {
await this.initDB();
}

text
  const pendingCount = await this.db.countFromIndex(
    this.storeNames.SYNC_QUEUE,
    'status',
    'pending'
  );

  const failedCount = await this.db.countFromIndex(
    this.storeNames.SYNC_QUEUE,
    'status',
    'failed'
  );

  const processingCount = await this.db.countFromIndex(
    this.storeNames.SYNC_QUEUE,
    'status',
    'processing'
  );

  return {
    isOnline: this.isOnline,
    syncInProgress: this.syncInProgress,
    queueStatus: {
      pending: pendingCount,
      failed: failedCount,
      processing: processingCount,
      total: pendingCount + failedCount + processingCount
    },
    lastSync: await this.getLastSyncTime()
  };
} catch (error) {
  console.error('Failed to get sync status:', error);
  return {
    isOnline: this.isOnline,
    syncInProgress: false,
    queueStatus: { pending: 0, failed: 0, processing: 0, total: 0 },
    lastSync: null
  };
}
}

async getLastSyncTime() {
try {
const logs = await this.db.getAllFromIndex(
this.storeNames.SYNC_LOGS,
'type',
'sync_completed'
);

text
  if (logs.length > 0) {
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return logs[0].timestamp;
  }

  return null;
} catch (error) {
  return null;
}
}

async logSyncEvent(type, message, data = null) {
try {
if (!this.db) return;

text
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data
  };

  await this.db.add(this.storeNames.SYNC_LOGS, logEntry);
} catch (error) {
  console.error('Failed to log sync event:', error);
}
}

async clearOldData(daysToKeep = 30) {
try {
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

text
  // Clear old sync logs
  const logs = await this.db.getAll(this.storeNames.SYNC_LOGS);
  const oldLogs = logs.filter(log => new Date(log.timestamp) < cutoffDate);
  
  for (const log of oldLogs) {
    await this.db.delete(this.storeNames.SYNC_LOGS, log.id);
  }

  // Clear old sync queue items that are completed
  const queueItems = await this.db.getAll(this.storeNames.SYNC_QUEUE);
  const oldQueueItems = queueItems.filter(item => 
    (item.status === 'completed' || item.status === 'permanently_failed') &&
    new Date(item.createdAt) < cutoffDate
  );
  
  for (const item of oldQueueItems) {
    await this.db.delete(this.storeNames.SYNC_QUEUE, item.id);
  }

  await this.logSyncEvent('info', `Cleared data older than ${daysToKeep} days`);
} catch (error) {
  console.error('Failed to clear old data:', error);
  await this.logSyncEvent('error', `Failed to clear old data: ${error.message}`);
}
}

handleOnline() {
this.isOnline = true;
this.logSyncEvent('info', 'Device came online');

text
// Start processing sync queue
setTimeout(() => this.processSyncQueue(), 1000);
}

handleOffline() {
this.isOnline = false;
this.logSyncEvent('warning', 'Device went offline');
}

async exportOfflineData() {
try {
const exportData = {};

text
  for (const storeName of Object.values(this.storeNames)) {
    exportData[storeName] = await this.db.getAll(storeName);
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `constructiq-offline-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
} catch (error) {
  console.error('Failed to export offline data:', error);
  throw error;
}
}

async importOfflineData(file) {
try {
const text = await file.text();
const importData = JSON.parse(text);

text
  // Clear existing data
  for (const storeName of Object.values(this.storeNames)) {
    const keys = await this.db.getAllKeys(storeName);
    for (const key of keys) {
      await this.db.delete(storeName, key);
    }
  }

  // Import new data
  for (const [storeName, data] of Object.entries(importData)) {
    if (this.storeNames[storeName.toUpperCase()] === storeName) {
      for (const item of data) {
        await this.db.put(storeName, item);
      }
    }
  }

  await this.logSyncEvent('info', 'Offline data imported successfully');
  return { success: true, message: 'Data imported successfully' };
} catch (error) {
  console.error('Failed to import offline data:', error);
  await this.logSyncEvent('error', `Failed to import data: ${error.message}`);
  return { success: false, error: error.message };
}
}
}
