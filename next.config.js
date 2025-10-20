/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE output: 'export' completely
  experimental: {
    optimizeCss: false, // Disable CSS optimization
  },
  // Or disable preloading entirely
  compress: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
