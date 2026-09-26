/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig = {
  distDir: process.env.HW2_BUILD_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      // Old browser-only coin page → server-verified Hidden Coin tasks.
      { source: '/hidden-wiki-2/getrich', destination: '/hidden-wiki-2/moneytasks', permanent: false },
      { source: '/hidden-wiki-2/finance/:path*', destination: '/hidden-wiki-2/blackmarket', permanent: false },
      { source: '/blackmarket/:path*', destination: '/hidden-wiki-2/blackmarket/:path*', permanent: false },
    ]
  },
}

export default nextConfig
