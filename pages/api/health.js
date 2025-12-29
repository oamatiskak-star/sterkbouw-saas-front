// pages/api/health.js
export default function handler(req, res) {
  return res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'sterkbouw-frontend',
    router: 'pages-router',
    nodeVersion: process.version
  });
}
