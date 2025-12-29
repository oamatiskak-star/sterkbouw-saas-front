/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Zorg dat Tabler goed wordt opgelost
      '@tabler/core': require.resolve('@tabler/core'),
    }
    return config
  },
}

module.exports = nextConfig
