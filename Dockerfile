FROM node:20-alpine AS builder

WORKDIR /app

# Kopieer package files
COPY package.json package-lock.json* ./

# Installeer dependencies MET legacy-peer-deps
RUN if [ -f package-lock.json ] && [ -s package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

# Kopieer rest
COPY . .

# Build Next.js
RUN npm run build

# Productie image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ✅ BELANGRIJK: Kopieer node_modules voor next commando
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ✅ Gebruik node server.js ipv next start voor standalone
CMD ["node", "server.js"]
