/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    dirs: ['app', 'src']
  },
  poweredByHeader: false,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'development'
  },
  images: {
    domains: ['localhost']
  }
}

module.exports = nextConfig