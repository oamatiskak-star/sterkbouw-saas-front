/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Als je App Router gebruikt:
  // experimental: {
  //   appDir: true,
  // },
}

module.exports = nextConfig
