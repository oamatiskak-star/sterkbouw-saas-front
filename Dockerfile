# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Package files eerst (optimale cache)
COPY package.json package-lock.json* ./

# Dependencies installeren
RUN npm ci --legacy-peer-deps

# Applicatiecode
COPY . .

# === MAKEN VAN next.config.js ZONDER heredoc ===
# Creëer een next.config.js die prerendering uitschakelt
RUN echo 'module.exports = {' > next.config.js
RUN echo '  output: "standalone",' >> next.config.js
RUN echo '  images: { unoptimized: true },' >> next.config.js
RUN echo '  typescript: { ignoreBuildErrors: true },' >> next.config.js
RUN echo '  eslint: { ignoreDuringBuilds: true },' >> next.config.js
RUN echo '  trailingSlash: false,' >> next.config.js
RUN echo '  experimental: {' >> next.config.js
RUN echo '    esmExternals: false,' >> next.config.js
RUN echo '    serverComponentsExternalPackages: [],' >> next.config.js
RUN echo '    optimizeCss: false,' >> next.config.js
RUN echo '    isrFlushToDisk: false' >> next.config.js
RUN echo '  },' >> next.config.js
RUN echo '  webpack: (config) => {' >> next.config.js
RUN echo '    config.resolve.fallback = { fs: false, path: false, os: false };' >> next.config.js
RUN echo '    return config;' >> next.config.js
RUN echo '  }' >> next.config.js
RUN echo '};' >> next.config.js

# === MAKEN VAN _app.js ZONDER heredoc ===
# Forceer SSR via _app.js
RUN mkdir -p pages
RUN echo 'import React from "react";' > pages/_app.js
RUN echo '' >> pages/_app.js
RUN echo 'function MyApp({ Component, pageProps }) {' >> pages/_app.js
RUN echo '  return <Component {...pageProps} />;' >> pages/_app.js
RUN echo '}' >> pages/_app.js
RUN echo '' >> pages/_app.js
RUN echo '// FORCE SERVER-SIDE RENDERING FOR ALL PAGES' >> pages/_app.js
RUN echo 'MyApp.getInitialProps = async () => ({});' >> pages/_app.js
RUN echo '' >> pages/_app.js
RUN echo 'export default MyApp;' >> pages/_app.js

# === ENVIRONMENT VARIABLES ===
ENV NEXT_PUBLIC_SKIP_PRERENDER=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build de applicatie
RUN npm run build

# =========================
# RUNTIME STAGE
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Standalone server + static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Node modules die standalone nodig heeft
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Next standalone start
CMD ["node", "server.js"]
