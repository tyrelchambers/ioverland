/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "ioverland.b-cdn.net",
      },
      {
        hostname: "img.clerk.com",
      },
    ],
  },
};

module.exports = nextConfig;
