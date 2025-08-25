/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: false
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