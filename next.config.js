/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: false,
  swcMinify: true,

  // ❌ ESM UIT — dit is de oorzaak
  experimental: {
    esmExternals: false,
  },

  // ❗ Ant Design / rc-* correct transpilen
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
  ],

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
