/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // Schakel ALLE static features uit
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  // Forceer dynamisch gedrag
  experimental: { esmExternals: false },
};

module.exports = nextConfig;
