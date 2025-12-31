/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: false,

  // ❗ GEEN rc-util hier
  transpilePackages: [
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-picker',
  ],

  experimental: {
    esmExternals: false, // 🔑 ABSOLUUT VERPLICHT
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // ❗ Dwing rc-util naar pure CJS runtime
      config.externals = config.externals || []
      config.externals.push('rc-util')
    }

    return config
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
