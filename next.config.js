/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE output: 'export' completely
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
