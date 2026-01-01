const withTM = require('next-transpile-modules')([
  'antd', '@ant-design/icons', '@ant-design/cssinjs',
  'rc-util', 'rc-picker', 'rc-select', 'rc-table',
  'rc-tree', 'rc-tooltip', 'rc-field-form',
  '@mui/material', '@emotion/react', '@emotion/styled',
  '@mantine/core', '@mantine/hooks', 'recharts',
  'three', '@react-three/fiber', 'leaflet',
  'react-leaflet', 'jspdf', 'html2canvas',
  'xlsx', 'papaparse'
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    'antd', '@ant-design/icons', '@ant-design/cssinjs',
    '@mui/material', '@emotion/react', '@emotion/styled',
    '@mantine/core', '@mantine/hooks'
  ],
  compiler: {
    emotion: true
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [
      'antd', '@ant-design/icons', '@ant-design/cssinjs'
    ]
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

module.exports = withTM(nextConfig);
