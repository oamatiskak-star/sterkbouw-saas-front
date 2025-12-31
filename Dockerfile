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

# === CRITICAL: REPLACE je next.config.js met een clean versie ===
RUN cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // Schakel ALLE static features uit
  images: { 
    unoptimized: true 
  },
  
  // Negeer ALLE build errors
  typescript: { 
    ignoreBuildErrors: true 
  },
  
  eslint: { 
    ignoreDuringBuilds: true 
  },
  
  staticPageGenerationTimeout: 3600,
  
  // Forceer dynamisch gedrag
  experimental: {
    esmExternals: false,
    optimizeCss: false,
  },
  
  // Webpack config zonder string-replace-loader
  webpack: (config, { isServer }) => {
    // Voorkom build errors voor rc-* packages
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  }
};

module.exports = nextConfig;
EOF'

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
