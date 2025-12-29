#!/bin/bash

echo "=================================="
echo "NEXT.JS PAGES ROUTER SETUP SCRIPT"
echo "=================================="

# Stap 1: Backup huidige package.json
echo "1. Backup maken van huidige package.json..."
cp package.json package.json.backup

# Stap 2: Nieuwe package.json maken met Next.js dependencies
echo "2. Nieuwe package.json aanmaken..."

cat > package.json << 'EOF'
{
  "name": "sterkbouw-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.1",
    "@tabler/core": "^1.0.0-beta22",
    "axios": "^1.7.2",
    "chart.js": "^4.4.3",
    "formidable": "^3.5.1",
    "three": "^0.164.1",
    "next": "12.3.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^4.12.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "eslint": "8.48.0",
    "eslint-config-next": "12.3.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5"
  }
}
EOF

echo "✓ package.json bijgewerkt"

# Stap 3: Verwijder node_modules en package-lock.json
echo "3. Oude dependencies verwijderen..."
rm -rf node_modules package-lock.json

# Stap 4: Dependencies installeren
echo "4. Nieuwe dependencies installeren..."
npm install

# Stap 5: Next.js configuratie aanmaken
echo "5. Next.js configuratie aanmaken..."

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Pages Router gebruiken
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
EOF

echo "✓ next.config.js aangemaakt"

# Stap 6: PostCSS configuratie aanmaken
echo "6. PostCSS configuratie aanmaken..."

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "✓ postcss.config.js aangemaakt"

# Stap 7: Globale CSS aanmaken als die niet bestaat
echo "7. Globale CSS controleren..."

if [ ! -f "styles/globals.css" ]; then
  mkdir -p styles
  cat > styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom globals */
:root {
  --primary: #206bc4;
  --secondary: #6c757d;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
EOF
  echo "✓ styles/globals.css aangemaakt"
else
  echo "✓ styles/globals.css bestaat al"
fi

# Stap 8: Ensure pages directory exists with _app.js
echo "8. Pages directory controleren..."

mkdir -p pages

# Als _app.js niet bestaat, maak het aan
if [ ! -f "pages/_app.js" ]; then
  cat > pages/_app.js << 'EOF'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
EOF
  echo "✓ pages/_app.js aangemaakt"
else
  echo "✓ pages/_app.js bestaat al"
fi

# Stap 9: Maak een test dashboard aan
echo "9. Dashboard pagina controleren..."

if [ ! -f "pages/dashboard/index.js" ]; then
  mkdir -p pages/dashboard
  cat > pages/dashboard/index.js << 'EOF'
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Dashboard - Sterkbouw
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Projecten</h2>
          <p className="text-gray-600">Overzicht van alle projecten</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Financiën</h2>
          <p className="text-gray-600">Financiële rapporten</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Planning</h2>
          <p className="text-gray-600">Project planningen</p>
        </div>
      </div>
    </div>
  )
}
EOF
  echo "✓ pages/dashboard/index.js aangemaakt"
else
  echo "✓ pages/dashboard/index.js bestaat al"
fi

# Stap 10: Maak een index pagina aan
echo "10. Homepage controleren..."

if [ ! -f "pages/index.js" ]; then
  cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Welkom bij Sterkbouw
      </h1>
      <p className="text-gray-600 mb-8">
        Een modern bouwmanagement systeem
      </p>
      <a 
        href="/dashboard"
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Naar Dashboard
      </a>
    </div>
  )
}
EOF
  echo "✓ pages/index.js aangemaakt"
else
  echo "✓ pages/index.js bestaat al"
fi

# Stap 11: Verwijder oude app directory als die bestaat
echo "11. Oude App Router directory controleren..."

if [ -d "app" ]; then
  echo "   Oude app directory gevonden, hernoemen naar app_backup..."
  mv app app_backup
  echo "✓ app directory hernoemd naar app_backup"
fi

echo ""
echo "=================================="
echo "SETUP VOLTOOID!"
echo "=================================="
echo ""
echo "Voer de volgende commando's uit:"
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Open je browser op:"
echo "   http://localhost:3000"
echo ""
echo "3. Ga naar dashboard:"
echo "   http://localhost:3000/dashboard"
echo ""
echo "=================================="
