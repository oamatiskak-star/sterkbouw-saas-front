/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  // ❌ GEEN SSG / ISR – alles SSR
  experimental: {
    esmExternals: 'loose',
    optimizeCss: false,
  },

  // Ant Design / rc-* fix
  transpilePackages: [
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack(config, { isServer }) {
    // ⛔ voorkom build-time browser code
    if (isServer) {
      config.externals.push({
        'ws': 'commonjs ws',
      })
    }
    return config
  },
}

module.exports = nextConfig
