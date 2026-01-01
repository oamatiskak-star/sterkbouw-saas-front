/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
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
  },
  
  // Voeg deze webpack configuratie toe voor betere ESM ondersteuning
  webpack: (config, { isServer }) => {
    // Voor Ant Design icons en gerelateerde packages
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [
        /node_modules\/@ant-design/,
        /node_modules\/rc-/,
        /node_modules\/antd/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            ['@babel/plugin-transform-modules-commonjs', { lazy: true }]
          ]
        },
      },
    });
    
    // Fix voor ESM packages die niet correct werken
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // Zorg ervoor dat webpack 5 polyfills voor node.js modules bevat
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // Voeg headers toe voor CORS (optioneel, afhankelijk van je setup)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // Voeg redirects toe als dat nodig is (optioneel)
  async redirects() {
    return [];
  },
  
  // Voeg rewrites toe als dat nodig is (optioneel)
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig
