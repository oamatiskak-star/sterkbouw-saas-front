// SterkBouw-SaaS-Frontend/pages/api/proxy/[...path].js
export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  
  // Haal de backend URL uit environment variable
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API || "https://sterkbouw-saas-backend-production.up.railway.app";
  
  // Bouw de volledige URL
  const url = new URL(`${backendBaseUrl}/${path.join('/')}`);
  
  // Voeg query parameters toe
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key !== 'path') {
      url.searchParams.append(key, value);
    }
  });
  
  console.log('Proxying to:', url.toString());
  console.log('Method:', req.method);
  console.log('Auth header present:', !!req.headers.authorization);
  
  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });
    
    // Forward CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      details: error.message,
      url: url.toString() 
    });
  }
}
