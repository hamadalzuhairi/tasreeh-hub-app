/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tasreeh/shared"],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
