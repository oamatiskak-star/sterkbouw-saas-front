FROM node:20-alpine AS builder

WORKDIR /app

# Kopieer package files
COPY package.json package-lock.json* ./

# Eerst proberen npm ci, anders npm install
RUN if [ -f package-lock.json ] && [ -s package-lock.json ]; then npm ci; else npm install; fi

# Kopieer rest
COPY . .

# Build met standalone output
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
