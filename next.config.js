/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
    'rc-motion',
    'rc-trigger',
  ],

  experimental: {
    esmExternals: false, // CRUCIAAL
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // 🔒 Forceer Ant Design naar client-only
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
