// pages/api/health.js
export default async function handler(req, res) {
  try {
    const response = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'sterkbouw-frontend',
      hybrid: true,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// Voor App Router compatibiliteit
export const GET = handler;
