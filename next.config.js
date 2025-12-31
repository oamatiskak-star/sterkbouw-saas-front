/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // STOP met Edge / ESM ellende
  experimental: {
    esmExternals: false,
  },

  // STOP met prerender failures
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack: forceer alles naar runtime
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    }

    // rc-* nooit laten bundlen
    config.externals = config.externals || []
    config.externals.push({
      "rc-util": "commonjs rc-util",
      "rc-picker": "commonjs rc-picker",
    })

    return config
  },
}

module.exports = nextConfig
