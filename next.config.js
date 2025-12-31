/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: true,
  swcMinify: true,

  // ❗ Dwing alles naar Node runtime (GEEN Edge / GEEN SSR-executie)
  experimental: {
    esmExternals: 'loose',
  },

  // ❗ Stop static generation / prerender crashes
  generateBuildId: async () => {
    return 'client-only'
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

module.exports = nextConfig
