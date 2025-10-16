/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for dynamic data
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
};

module.exports = nextConfig;
