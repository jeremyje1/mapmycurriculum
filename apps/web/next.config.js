/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/assessment/onboarding',
        permanent: false,
      },
      {
        source: '/sandbox',
        destination: '/assessment/onboarding',
        permanent: false,
      },
    ];
  },
};
module.exports = nextConfig;
