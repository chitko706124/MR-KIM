/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE output: 'export' completely
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add this for better dynamic routing
  trailingSlash: false,
};

module.exports = nextConfig;
