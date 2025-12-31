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

# === DIRECTE OPLOSSING: Creëer getServerSideProps voor alle pagina's ===
# Dit forceert server-side rendering ipv static generation
RUN find pages -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | \
    xargs -I {} sh -c 'if ! grep -q "getServerSideProps\|getInitialProps" "{}"; then \
      echo "Adding getServerSideProps to {}"; \
      mv "{}" "{}.bak" && \
      echo "export async function getServerSideProps() { return { props: {} } }" > "{}" && \
      cat "{}.bak" >> "{}" && \
      rm "{}.bak"; \
    fi' 2>/dev/null || true

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
