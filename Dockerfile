# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Package files eerst
COPY package.json package-lock.json* ./

# Dependencies installeren
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

# Applicatiecode
COPY . .

# Maak een simpele next.config.js
RUN echo 'module.exports={output:"standalone",images:{unoptimized:true},typescript:{ignoreBuildErrors:true},eslint:{ignoreDuringBuilds:true}}' > next.config.js

# Maak _app.js met getInitialProps
RUN mkdir -p pages
RUN echo 'import React from "react";' > pages/_app.js
RUN echo 'function MyApp({Component,pageProps}){return<Component{...pageProps}/>}' >> pages/_app.js
RUN echo 'MyApp.getInitialProps=async()=>({});' >> pages/_app.js
RUN echo 'export default MyApp;' >> pages/_app.js

# Environment variables
ENV NEXT_PUBLIC_SKIP_PRERENDER=true
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN npm run build

# =========================
# RUNTIME STAGE
# =========================
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
