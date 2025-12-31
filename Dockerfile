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

# === MAak next.config.js ZONDER heredoc ===
RUN echo 'module.exports = {' > next.config.js
RUN echo '  output: "standalone",' >> next.config.js
RUN echo '  images: { unoptimized: true },' >> next.config.js
RUN echo '  typescript: { ignoreBuildErrors: true },' >> next.config.js
RUN echo '  eslint: { ignoreDuringBuilds: true },' >> next.config.js
RUN echo '  experimental: { esmExternals: false }' >> next.config.js
RUN echo '}' >> next.config.js

# === Forceer environment variables ===
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
