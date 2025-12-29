# Dockerfile
FROM node:20-alpine AS builder

# Werkmap instellen
WORKDIR /app

# 1. Eerst alleen package.json en package-lock.json kopiëren
COPY package.json package-lock.json* ./

# 2. Clean install met lockfile
RUN npm ci

# 3. Rest van de code kopiëren
COPY . .

# 4. Build de applicatie
RUN npm run build

# 5. Productie image
FROM node:20-alpine AS runner

WORKDIR /app

# Omgeving variabelen (gebruik Railway secrets ipv hier te zetten)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Gebruiker maken
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Rechten instellen
RUN chown -R nextjs:nodejs /app

# Gebruiker switchen
USER nextjs

# Poort exposen
EXPOSE 3000

# Server starten
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
