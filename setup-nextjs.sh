#!/bin/bash

# ============================================
# NEXT.JS PAGES ROUTER SETUP - REPO ROOT EDITION
# ============================================
# Dit script zet je project om naar een werkende Next.js Pages Router app
# Voer uit in je project root (waar package.json staat)

echo "============================================"
echo "NEXT.JS PAGES ROUTER SETUP"
echo "============================================"

# ============================================
# STAP 1: CONTROLEREN OF WE IN REPO ROOT ZITTEN
# ============================================
echo "1. Controleren of we in repo root zijn..."
if [ ! -f "package.json" ]; then
    echo "❌ FOUT: Geen package.json gevonden in deze directory!"
    echo "❌ Zorg dat je dit script uitvoert in de project root (waar package.json hoort te staan)"
    exit 1
fi

echo "✅ package.json gevonden"
echo "📁 Huidige directory: $(pwd)"
ls -la | head -10

# ============================================
# STAP 2: BACKUP MAKEN VAN BESTAANDE CONFIGURATIES
# ============================================
echo ""
echo "2. Backups maken van bestaande configuraties..."

# Backup package.json als dat nog niet is gebeurd
if [ -f "package.json" ] && [ ! -f "package.json.backup" ]; then
    cp package.json package.json.backup
    echo "✅ package.json → package.json.backup"
fi

# Backup tailwind config
if [ -f "tailwind.config.js" ] && [ ! -f "tailwind.config.js.backup" ]; then
    cp tailwind.config.js tailwind.config.js.backup
    echo "✅ tailwind.config.js → tailwind.config.js.backup"
fi

# Backup next config als die bestaat
if [ -f "next.config.js" ] && [ ! -f "next.config.js.backup" ]; then
    cp next.config.js next.config.js.backup
    echo "✅ next.config.js → next.config.js.backup"
fi

# ============================================
# STAP 3: NIEUWE PACKAGE.JSON MET NEXT.JS EN REACT
# ============================================
echo ""
echo "3. Nieuwe package.json aanmaken met Next.js 12 en React 18..."

cat > package.json << 'EOF'
{
  "name": "sterkbouw-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next node_modules package-lock.json"
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

echo "✅ package.json bijgewerkt met Next.js 12 en React 18"

# ============================================
# STAP 4: NEXT.JS CONFIGURATIE BESTANDEN
# ============================================
echo ""
echo "4. Next.js configuratie bestanden aanmaken..."

# next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Zorg dat Pages Router gebruikt wordt (geen App Router)
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['localhost'],
  },
  // Compatibiliteit met Tabler CSS
  webpack: (config, { isServer }) => {
    // Voeg CSS ondersteuning toe
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    
    return config;
  },
}

module.exports = nextConfig
EOF
echo "✅ next.config.js aangemaakt"

# postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
echo "✅ postcss.config.js aangemaakt"

# ============================================
# STAP 5: OUDE APP ROUTER DIRECTORY AFHANDELEN
# ============================================
echo ""
echo "5. Oude App Router directory controleren..."

if [ -d "app" ]; then
    echo "⚠️  Oude 'app' directory gevonden!"
    echo "   Deze kan Pages Router blokkeren..."
    
    # Vraag wat te doen
    echo ""
    echo "Wat wil je doen met de 'app' directory?"
    echo "1) Hernoemen naar 'app_backup' (aanbevolen)"
    echo "2) Verwijderen (alleen als je zeker weet dat het oud is)"
    echo "3) Niets doen (kan problemen veroorzaken)"
    echo ""
    read -p "Kies optie (1/2/3): " app_choice
    
    case $app_choice in
        1)
            mv app app_backup
            echo "✅ 'app' hernoemd naar 'app_backup'"
            ;;
        2)
            rm -rf app
            echo "✅ 'app' directory verwijderd"
            ;;
        3)
            echo "⚠️  'app' directory blijft staan - mogelijk conflicten met Pages Router"
            ;;
        *)
            mv app app_backup
            echo "✅ 'app' hernoemd naar 'app_backup' (standaard keuze)"
            ;;
    esac
else
    echo "✅ Geen oude 'app' directory gevonden"
fi

# ============================================
# STAP 6: NODE_MODULES OPNIEUW INSTALLEREN
# ============================================
echo ""
echo "6. Oude node_modules verwijderen en nieuwe installeren..."

# Verwijder eerst de oude
if [ -d "node_modules" ]; then
    echo "🗑️  Oude node_modules verwijderen..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "🗑️  package-lock.json verwijderen..."
    rm -f package-lock.json
fi

# Nieuwe dependencies installeren
echo "📦 Nieuwe dependencies installeren..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies succesvol geïnstalleerd"
else
    echo "❌ Fout bij installeren dependencies. Probeer handmatig:"
    echo "   npm install"
fi

# ============================================
# STAP 7: VERIFICATIE VAN STRUCTUUR
# ============================================
echo ""
echo "7. Project structuur verifiëren..."

# Zorg dat pages directory bestaat
mkdir -p pages
echo "✅ pages/ directory gecontroleerd"

# Zorg dat _app.js bestaat (basale versie)
if [ ! -f "pages/_app.js" ]; then
    echo "⚠️  pages/_app.js niet gevonden. Basale versie aanmaken..."
    
    # Maak eerst styles directory als die niet bestaat
    mkdir -p styles
    
    # Maak globals.css aan
    if [ ! -f "styles/globals.css" ]; then
        cat > styles/globals.css << 'EOF'
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tabler CSS importeren */
@import '@tabler/core/dist/css/tabler.min.css';

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

/* Next.js container */
#__next {
  min-height: 100vh;
}
EOF
        echo "✅ styles/globals.css aangemaakt"
    fi
    
    # Maak _app.js aan
    cat > pages/_app.js << 'EOF'
// pages/_app.js - Basale versie
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
EOF
    echo "✅ pages/_app.js aangemaakt"
else
    echo "✅ pages/_app.js bestaat al"
fi

# Controleer of dashboard directory bestaat
if [ ! -d "pages/dashboard" ]; then
    echo "⚠️  pages/dashboard directory niet gevonden"
    mkdir -p pages/dashboard
    
    # Maak een test dashboard
    cat > pages/dashboard/index.js << 'EOF'
// pages/dashboard/index.js - Test dashboard
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">
        🚧 Dashboard - Sterkbouw
      </h1>
      <p className="text-gray-600 mb-8">
        Dit is een test dashboard. Voeg je eigen inhoud toe.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Projecten</h2>
          <p className="text-gray-600">Overzicht van alle projecten</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">💰 Financiën</h2>
          <p className="text-gray-600">Financiële rapporten</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📅 Planning</h2>
          <p className="text-gray-600">Project planningen</p>
        </div>
      </div>
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          ℹ️  Next.js Pages Router is actief. Je dashboard is bereikbaar op /dashboard
        </p>
      </div>
    </div>
  )
}
EOF
    echo "✅ Test dashboard aangemaakt op pages/dashboard/index.js"
else
    echo "✅ pages/dashboard directory bestaat al"
fi

# ============================================
# STAP 8: NEXT.JS CACHE SCHOONMAKEN
# ============================================
echo ""
echo "8. Next.js cache opschonen..."

if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ .next cache verwijderd"
else
    echo "✅ Geen .next cache gevonden"
fi

# ============================================
# STAP 9: EINDCONTROLE
# ============================================
echo ""
echo "============================================"
echo "SETUP VOLTOOID!"
echo "============================================"
echo ""
echo "📋 SAMENVATTING:"
echo "----------------"
echo "• Next.js 12 (Pages Router) geïnstalleerd"
echo "• React 18 geïnstalleerd"
echo "• Configuratie bestanden aangemaakt"
echo "• Dependencies geüpdatet"
echo ""
echo "🚀 START JE PROJECT:"
echo "-------------------"
echo "1. Start de development server:"
echo "   npm run dev"
echo ""
echo "2. Open je browser op:"
echo "   http://localhost:3000"
echo ""
echo "3. Ga naar je dashboard:"
echo "   http://localhost:3000/dashboard"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "------------------"
echo "• Zie je fouten? Probeer: rm -rf node_modules .next && npm install"
echo "• Werkt Tailwind niet? Controleer tailwind.config.js"
echo "• Toch App Router? Verwijder/hernieuw de 'app' directory"
echo ""
echo "📁 JE STRUCTUUR NU:"
echo "------------------"
find . -maxdepth 2 -type f -name "*.js" -o -name "*.json" -o -name "*.css" | grep -v node_modules | sort

echo ""
echo "============================================"
