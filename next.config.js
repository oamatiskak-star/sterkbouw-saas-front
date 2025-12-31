/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  // ❌ Static prerendering UIT
  experimental: {
    esmExternals: false,
  },

  // 🚫 Blokkeer Ant Design tijdens server prerender
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        antd: false,
        'rc-util': false,
        'rc-picker': false,
        'rc-motion': false,
        'rc-trigger': false,
      }
    }

    return config
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
