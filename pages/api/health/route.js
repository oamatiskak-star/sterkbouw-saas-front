// app/api/health/route.js
export async function GET(request) {
  return new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'sterkbouw-frontend',
      router: 'app-router',
      nodeVersion: process.version
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
