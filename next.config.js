/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO output: 'export' - This is crucial
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
