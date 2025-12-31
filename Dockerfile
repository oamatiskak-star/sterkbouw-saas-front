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

# === BETER PATCH SCRIPT ===
RUN cat > patch-app.js << 'EOF'
const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'pages', '_app.js');

if (fs.existsSync(appFile)) {
  let content = fs.readFileSync(appFile, 'utf8');
  
  // Remove any existing getInitialProps
  content = content.replace(/MyApp\.getInitialProps\s*=\s*async\s*\(\)\s*=>\s*\({}\);/g, '');
  content = content.replace(/getInitialProps/g, '');
  
  // Find where to insert getInitialProps
  const lines = content.split('\n');
  let newContent = '';
  let inserted = false;
  
  for (let i = 0; i < lines.length; i++) {
    newContent += lines[i] + '\n';
    
    // Insert after MyApp function/component definition
    if (!inserted && (
      lines[i].includes('function MyApp') ||
      lines[i].includes('const MyApp =') ||
      lines[i].includes('export default class MyApp') ||
      lines[i].includes('class MyApp') ||
      (lines[i].includes('export default') && lines[i].includes('MyApp'))
    )) {
      // Find the end of the function/component
      let j = i + 1;
      let braceCount = 0;
      while (j < lines.length && !inserted) {
        if (lines[j].includes('{')) braceCount++;
        if (lines[j].includes('}')) {
          braceCount--;
          if (braceCount === 0) {
            // Insert getInitialProps after the closing brace
            newContent += '\nMyApp.getInitialProps = async () => ({});\n';
            inserted = true;
          }
        }
        j++;
        if (j >= lines.length) break;
      }
    }
  }
  
  // If we couldn't find where to insert, add at the end before export
  if (!inserted) {
    newContent = newContent.replace(
      'export default MyApp',
      'MyApp.getInitialProps = async () => ({});\n\nexport default MyApp'
    );
  }
  
  fs.writeFileSync(appFile, newContent);
  console.log('Patched _app.js with getInitialProps');
} else {
  // Create new _app.js
  fs.mkdirSync(path.join(__dirname, 'pages'), { recursive: true });
  fs.writeFileSync(appFile, `
import React from 'react'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

MyApp.getInitialProps = async () => ({})

export default MyApp
  `);
  console.log('Created _app.js with getInitialProps');
}
EOF'

# Voer patch script uit
RUN node patch-app.js

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
