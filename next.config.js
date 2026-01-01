/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // 1. SCHAKEL ALLE STATISCHE FEATURES UIT
  trailingSlash: false,
  images: {
    unoptimized: true,
  },

  // 2. NEGEER ALLE BUILD ERRORS
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 60,

  // 3. STATIC GENERATION UIT
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: [],
    optimizeCss: false,
    isrFlushToDisk: false,
    workerThreads: false,
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },

  // 4. FORCEER DYNAMIC RENDERING
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          {
            key: 'x-nextjs-cache',
            value: 'DYNAMIC',
          },
        ],
      },
    ];
  },

  // 5. WEBPACK — ANT DESIGN VOLLEDIG SERVER-BLIND MAKEN
  webpack: (config, { isServer }) => {
    // Node fallbacks
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    // Voorkom static optimizations
    config.optimization = {
      ...config.optimization,
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
    };

    // ⛔ SERVER: vervang Ant Design door stub (GEEN SSR-crash)
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        antd: require.resolve('./lib/antd-server-stub'),
        '@ant-design/icons': require.resolve('./lib/antd-server-stub'),
        '@ant-design/icons-svg': require.resolve('./lib/antd-server-stub'),
        'rc-util': require.resolve('./lib/antd-server-stub'),
        'rc-picker': require.resolve('./lib/antd-server-stub'),
      };
    }

    return config;
  },

  // 6. REWRITES (NO-OP, MAAR BEHOUD DYNAMISCH GEDRAG)
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },

  // 7. DISABLE STATIC EXPORT
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
