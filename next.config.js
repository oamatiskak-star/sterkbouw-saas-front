/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Zorg dat je Pages Router gebruikt
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
