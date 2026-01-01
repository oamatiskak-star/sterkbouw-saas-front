/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * 🔑 DIT IS DE FIX
   * Ant Design + rc-* forceren door SWC transpiler
   * zodat Node ze als CJS kan laden
   */
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
    'rc-motion',
    'rc-trigger',
    'rc-tooltip',
    'rc-dropdown',
  ],

  experimental: {
    /**
     * ❗ NIET false
     * ❗ NIET true
     * 👉 loose is vereist voor AntD
     */
    esmExternals: 'loose',
  },

  webpack: (config) => {
    /**
     * ❗ GEEN externals voor AntD
     * ❗ GEEN alias false
     * ❗ GEEN clientOnly hacks
     */

    return config
  },
}

module.exports = nextConfig
