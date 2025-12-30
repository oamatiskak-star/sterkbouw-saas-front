/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build voor Docker / Railway
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  images: {
    // Behoud huidige remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Samengevoegd: localhost + Supabase
    domains: [
      'localhost',
      'your-supabase-domain.supabase.co',
    ],
  },

  // Experimentele features geminimaliseerd
  experimental: {
    optimizeCss: false,
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Build stabiliteit
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  compiler: {
    // Debugging toegestaan
    removeConsole: false,
  },

  async headers() {
    return [
      // Security headers (globaal)
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      // CORS headers voor API-routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
