/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        child_process: false,
        async_hooks: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 