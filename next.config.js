/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: false,

  experimental: {
    esmExternals: false, // ❗ ABSOLUUT VERPLICHT
  },

  webpack: (config, { isServer }) => {
    // ❗ forceer rc-util naar runtime require (NOOIT bundlen)
    config.externals = [
      ...(config.externals || []),
      'rc-util',
    ]

    return config
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
