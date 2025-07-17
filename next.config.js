/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: { unoptimized: true },
  basePath: "/GymAr", 
  assetPrefix: "/GymAr",
};

module.exports = nextConfig;