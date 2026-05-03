/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000", // Make sure this matches your dev port
        pathname: "/**",
      },
      // Add your production hostname as well
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-site.com',
      //   pathname: '/**',
      // },
    ],
  },
};

module.exports = nextConfig;
