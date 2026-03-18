/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DB_PATH: process.env.DB_PATH || "../data/kanen.db",
  },
};

export default nextConfig;
