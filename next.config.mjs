// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 300,
      aggregateTimeout: 150,
    };
    return config;
  },
};

// Change this line - use ES Module export syntax instead of CommonJS
export default nextConfig;
