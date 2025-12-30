import { createRouter } from 'next-connect';

const router = createRouter();

router.post(async (req, res) => {
try {
const { action, data, timestamp } = req.body;

text
if (!action) {
  return res.status(400).json({ error: 'Action is required' });
}

console.log('Sync request:', { action, data, timestamp });

// Simulate sync processing
await new Promise(resolve => setTimeout(resolve, 500));

const response = {
  success: true,
  message: `Sync ${action} completed`,
  syncedAt: new Date().toISOString(),
  receivedData: data,
};

res.status(200).json(response);
} catch (error) {
console.error('Sync error:', error);
res.status(500).json({ error: 'Sync failed', details: error.message });
}
});

router.get(async (req, res) => {
try {
const { lastSync } = req.query;

text
console.log('Sync status check, last sync:', lastSync);

// Simulate fetching changes since last sync
const changes = [
  { id: '1', type: 'inspection', action: 'update', timestamp: new Date().toISOString() },
  { id: '2', type: 'material', action: 'create', timestamp: new Date().toISOString() },
];

res.status(200).json({
  success: true,
  lastSync: new Date().toISOString(),
  changes: changes,
});
} catch (error) {
console.error('Sync status error:', error);
res.status(500).json({ error: 'Failed to get sync status' });
}
});

export default router.handler();

