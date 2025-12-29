FROM node:20-alpine AS builder

WORKDIR /app

# Kopieer ALLEEN package.json
COPY package.json ./

# Gebruik npm install ipv npm ci - werkt altijd
RUN npm install

# Kopieer rest van de code
COPY . .

# Build Next.js (gebruik standalone output voor Railway)
RUN npm run build

# Productie image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Kopieer build resultaten
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
