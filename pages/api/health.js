// pages/api/health.js OF app/api/health/route.js
export async function GET(request) {
  // Werkt in beide router systemen
  return new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      router: 'hybrid' 
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
