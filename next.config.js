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
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false
      };
    }
    return config;
  }
};

export default nextConfig;  // <- Gebruik export, niet module.exports
