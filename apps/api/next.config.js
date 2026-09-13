/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tasreeh/shared"],
  eslint: { ignoreDuringBuilds: true },
  // The API has no UI; send visitors of the bare domain to the app website with a real HTTP redirect.
  async redirects() {
    return [
      { source: "/", destination: process.env.APP_URL || "https://tasreeh-hub.vercel.app", permanent: false },
    ];
  },
};

module.exports = nextConfig;
