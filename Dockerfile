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

# === WORKAROUND: Voeg _app.js getInitialProps toe ===
# Dit forceert ALLE pagina's om server-side gerenderd te worden
RUN if [ -f "pages/_app.js" ] || [ -f "pages/_app.jsx" ]; then \
      echo "Patching _app.js to add getInitialProps..."; \
      APP_FILE=$(find pages -name "_app.js" -o -name "_app.jsx" | head -1); \
      if [ -f "$APP_FILE" ]; then \
        cp "$APP_FILE" "$APP_FILE.bak"; \
        sed -i '1i\// Force server-side rendering for all pages\nMyApp.getInitialProps = async () => ({})' "$APP_FILE"; \
      fi; \
    else \
      echo "Creating _app.js with getInitialProps..."; \
      mkdir -p pages; \
      cat > pages/_app.js << 'EOF'
import React from 'react'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// Force server-side rendering for ALL pages
MyApp.getInitialProps = async () => ({})

export default MyApp
EOF
    fi

# === SIMPELE CONFIG ===
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
