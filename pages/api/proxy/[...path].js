// SterkBouw-SaaS-Frontend/pages/api/proxy/[...path].js
export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  
  // Debug logging
  console.log('Proxy received:', { path, queryParams, method: req.method });
  
  try {
    // 1. Haal de base URL op (EXECUTOR)
    const baseUrl = process.env.NEXT_PUBLIC_EXECUTOR_API || "https://sterkbouw-saas-executor-production.up.railway.app";
    
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error(`Invalid base URL: ${baseUrl}`);
    }
    
    // 2. Zorg dat path een array is
    const pathArray = Array.isArray(path) ? path : [path || ''].filter(Boolean);
    
    if (pathArray.length === 0) {
      return res.status(400).json({ error: 'No path provided' });
    }
    
    // 3. Bouw de URL op een veilige manier
    const pathString = pathArray.join('/');
    
    // Verwijder dubbele slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = pathString.replace(/^\//, '');
    
    const targetUrl = `${cleanBaseUrl}/${cleanPath}`;
    
    console.log('Proxying to:', targetUrl);
    
    // 4. Voeg query parameters toe
    const url = new URL(targetUrl);
    
    // Voeg query parameters toe (exclusief 'path')
    Object.entries(queryParams).forEach(([key, value]) => {
      if (key !== 'path') {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else {
          url.searchParams.append(key, value);
        }
      }
    });
    
    // 5. Log de uiteindelijke URL
    console.log('Final URL:', url.toString());
    
    // 6. Maak de fetch request
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      }
    };
    
    // Voeg body toe voor niet-GET requests
    if (req.method !== 'GET' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url.toString(), fetchOptions);
    
    // 7. Verwerk response
    let data;
    try {
      data = await response.json();
    } catch {
      data = { text: await response.text() };
    }
    
    // 8. Stuur response terug
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    // Specifieke foutmelding voor URL errors
    if (error.message.includes('Invalid URL')) {
      return res.status(500).json({ 
        error: 'Invalid URL in proxy', 
        details: error.message,
        received: { path, queryParams }
      });
    }
    
    res.status(500).json({ 
      error: 'Proxy error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
