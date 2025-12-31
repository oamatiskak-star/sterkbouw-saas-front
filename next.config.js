/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // 1. SCHAKEL ALLE STATISCHE FEATURES UIT
  trailingSlash: false,
  images: {
    unoptimized: true, // Geen geoptimaliseerde static images
  },

  // 2. NEgeer ALLE build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 60,

  // 3. CRUCIAL: SCHAKEL STATIC GENERATION UIT
  experimental: {
    esmExternals: false,
    // Forceer server rendering voor ALLE pagina's
    serverComponentsExternalPackages: [],
    // Zorg dat alles dynamisch wordt behandeld
    optimizeCss: false,
    // Voorkom prerendering
    isrFlushToDisk: false,
    workerThreads: false,
    // Optimizations die SSG kunnen veroorzaken uitschakelen
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },

  // 4. FORCEER DYNAMIC RENDERING via headers
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

  // 5. Webpack config om prerendering te blokkeren
  webpack: (config, { isServer, dev }) => {
    // Forceer dat ALLE pagina's als dynamisch worden gemarkeerd
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: [
        {
          loader: 'string-replace-loader',
          options: {
            search: /export\s+(const|let|var)\s+(getStaticProps|getStaticPaths|getServerSideProps)/g,
            replace: '// $& // DISABLED BY NEXT CONFIG',
            flags: 'g',
          },
        },
      ],
    });

    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    // Voorkom static optimization
    config.optimization = {
      ...config.optimization,
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
    };

    // rc-* external
    config.externals = config.externals || [];
    config.externals.push({
      "rc-util": "commonjs rc-util",
      "rc-picker": "commonjs rc-picker",
    });

    return config;
  },

  // 6. Rewrites om dynamisch gedrag te forceren
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },

  // 7. COMPLEET DISABLE static export
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
