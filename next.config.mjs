/** @type {import('next').NextConfig} */
const contentSecurityPolicy = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src-attr 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Referrer-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig = {
  distDir: process.env.HIDDEN_WIKI_BUILD_DIR || process.env.HW2_BUILD_DIR || '.next',
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
      // Compatibility only: old bookmarks keep working after the rename.
      { source: '/hidden-wiki-2', destination: '/hidden-wiki', permanent: true },
      { source: '/hidden-wiki-2/:path*', destination: '/hidden-wiki/:path*', permanent: true },
      // Old browser-only coin page → server-verified Hidden Coin tasks.
      { source: '/hidden-wiki/getrich', destination: '/hidden-wiki/moneytasks', permanent: false },
      { source: '/hidden-wiki/finance/:path*', destination: '/hidden-wiki/blackmarket', permanent: false },
      { source: '/blackmarket/:path*', destination: '/hidden-wiki/blackmarket/:path*', permanent: false },
    ]
  },
}

export default nextConfig
