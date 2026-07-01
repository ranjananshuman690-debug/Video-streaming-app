/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
  // Disable telemetry to fix network errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
