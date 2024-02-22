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
      {
        hostname: "images.unsplash.com",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
