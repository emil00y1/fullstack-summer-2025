// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Your other config options can stay here
  // webpackDevMiddleware: (config) => {
  //   config.watchOptions = {
  //     poll: 300,
  //     aggregateTimeout: 150,
  //   };
  //   return config;
  // },
};

// Keep the ES Module export syntax
export default nextConfig;
