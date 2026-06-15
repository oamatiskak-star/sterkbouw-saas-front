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

  // Domeinmigratie naar calculatie.strkbouw.nl — host-based 301 voor het oude domein.
  // VEILIG GATED: alleen actief als env STERKCALC_DOMAIN_REDIRECT=true. Zet die flag op Vercel
  // PAS NADAT calculatie.strkbouw.nl aan het project hangt en serveert (anders outage).
  async redirects() {
    if (process.env.STERKCALC_DOMAIN_REDIRECT !== 'true') return []
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'app.sterkbouw.nl' }],
        destination: 'https://calculatie.strkbouw.nl/:path*',
        statusCode: 301,
      },
    ]
  }
}

module.exports = nextConfig
