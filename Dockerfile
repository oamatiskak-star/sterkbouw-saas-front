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

# === CORRECTE _app.js PATCH ===
# Patch de _app.js op de juiste manier
RUN if [ -f "pages/_app.js" ]; then \
      echo "Patching _app.js..."; \
      # Backup maken
      cp pages/_app.js pages/_app.js.backup; \
      # Verwijder eventuele bestaande getInitialProps
      sed -i '/MyApp.getInitialProps/d' pages/_app.js; \
      sed -i '/getInitialProps/d' pages/_app.js; \
      # Voeg getInitialProps toe NA de functie definitie
      sed -i '/function MyApp\|const MyApp\|export default class MyApp\|class MyApp/ a\MyApp.getInitialProps = async () => ({});' pages/_app.js; \
    else \
      echo "Creating _app.js with getInitialProps..."; \
      mkdir -p pages; \
      cat > pages/_app.js << 'EOF'
import React from 'react'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

MyApp.getInitialProps = async () => ({})

export default MyApp
EOF
    fi

# Creëer een clean next.config.js
RUN echo 'module.exports = {output:"standalone",images:{unoptimized:true}}' > next.config.js

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
