/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: false,

  transpilePackages: [
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-picker'
    // ❌ rc-util HIER NIET MEER
  ],

  experimental: {
    esmExternals: false, // 🔑 DIT IS DE KERN
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Forceer Ant Design stack naar CJS
      config.externals = config.externals || []
      config.externals.push({
        'rc-util': 'commonjs rc-util',
      })
    }

    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
