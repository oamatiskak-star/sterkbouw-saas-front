/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ===============================
  // BUILD / RUNTIME STABILITEIT
  // ===============================
  reactStrictMode: false,
  swcMinify: false,

  images: {
    unoptimized: true,
  },

  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ===============================
  // CRUCIAAL: ESM / CJS OVERRULE
  // ===============================
  experimental: {
    /**
     * Laat Next.js ESM packages losjes behandelen
     * i.p.v. hard in CJS forceren (dit voorkomt Context.js crash)
     */
    esmExternals: 'loose',
  },

  /**
   * DIT IS DE KERNOPLOSSING
   * ----------------------
   * Ant Design en icons worden NU mee-gecompileerd
   * alsof het eigen broncode is.
   */
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
  ],

  // ===============================
  // WEBPACK – GEEN NODE POLYFILLS
  // ===============================
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    return config;
  },

  // ===============================
  // FORCE DYNAMIC RENDERING
  // ===============================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  distDir: '.next',
};

module.exports = nextConfig;
