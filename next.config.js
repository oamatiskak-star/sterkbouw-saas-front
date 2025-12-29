cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Uitgeschakelde App Router, zodat we Pages Router gebruiken
  experimental: {
    appDir: false,
  },
}

module.exports = nextConfig
EOF
