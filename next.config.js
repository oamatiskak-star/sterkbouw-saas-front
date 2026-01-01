/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Voor Docker
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-tree',
    'rc-table',
    'rc-input',
    'rc-input-number',
    'rc-select',
    'rc-slider',
    'rc-switch',
    'rc-checkbox',
    'rc-radio',
    'rc-tooltip',
    'rc-dropdown',
    'rc-motion',
    'rc-field-form',
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
    'rc-resize-observer',
    'rc-steps',
    'rc-virtual-list',
  ],
  compiler: {
    styledComponents: true, // Als je styled-components gebruikt
  },
  experimental: {
    // Forceer ESM handling voor bepaalde packages
    esmExternals: 'loose',
  },
  // Zorg dat Webpack AntD correct transpileert
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // AntD icon transform
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [
        /node_modules\/@ant-design/,
        /node_modules\/rc-/,
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            ['import', { libraryName: 'antd', style: true }],
          ],
        },
      },
    });
    
    return config;
  },
}

module.exports = nextConfig
