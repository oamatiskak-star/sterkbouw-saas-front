/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-picker',
    'rc-pagination',
    'rc-table',
    'rc-tree',
    'rc-tooltip',
    'rc-dropdown',
    'rc-field-form',
    'rc-input',
    'rc-input-number',
    'rc-select',
    'rc-slider',
    'rc-switch',
    'rc-checkbox',
    'rc-radio',
    'rc-notification',
    'rc-progress',
    'rc-rate',
    'rc-tabs',
    'rc-textarea',
    'rc-upload',
    'rc-collapse',
    'rc-menu',
    'rc-drawer',
    'rc-image',
    'rc-steps',
    'rc-virtual-list',
    'rc-resize-observer',
    'rc-motion',
  ],
  compiler: {
    emotion: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
