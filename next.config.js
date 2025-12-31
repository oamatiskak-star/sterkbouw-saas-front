/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output voor Docker / Railway
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  // Ant Design / rc-* compatibiliteit
  transpilePackages: [
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
  ],

  experimental: {
    // Dwing CommonJS-resolutie voor problematische ESM packages
    esmExternals: 'loose',
    optimizeCss: false,
  },

  // Webpack-level fix voor rc-util ESM crash (canUseDom)
  webpack: (config, { isServer }) => {
    // rc-util NIET opnieuw bundelen → voorkomt ERR_MODULE_NOT_FOUND
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      'rc-util',
    ]

    // Client-side safety (geen Node APIs)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  compiler: {
    removeConsole: false,
  },
}

module.export
