// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    message: 'SterkBouw Frontend API',
    timestamp: new Date().toISOString(),
    service: 'online'
  });
}
