/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-picker',
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
    '@mantine/core',
    '@mantine/hooks'
  ],
  compiler: {
    emotion: true
  },
  experimental: {
    esmExternals: false
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
