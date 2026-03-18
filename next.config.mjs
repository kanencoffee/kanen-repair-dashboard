/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    DB_PATH: process.env.DB_PATH || "../data/kanen.db",
  },
};

export default nextConfig;
