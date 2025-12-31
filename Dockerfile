# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Package files eerst (optimale cache)
COPY package.json package-lock.json* ./

# Dependencies installeren
RUN if [ -f package-lock.json ] && [ -s package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Applicatiecode
COPY . .

# Creëer een eenvoudige _app.js die SSR forceert
RUN echo 'import React from "react"; function MyApp({ Component, pageProps }) { return <Component {...pageProps} /> }; MyApp.getInitialProps = async () => ({}); export default MyApp;' > pages/_app.js

# Creëer een clean next.config.js
RUN echo 'module.exports = {output:"standalone",images:{unoptimized:true},typescript:{ignoreBuildErrors:true},eslint:{ignoreDuringBuilds:true}}' > next.config.js

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
COPY --from[builder /app/public ./public

# Node modules die standalone nodig heeft
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Next standalone start
CMD ["node", "server.js"]
