/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/offers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-cache'
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-cache'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
