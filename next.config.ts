import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mark Node.js-only packages as server-external so Next.js doesn't
  // attempt to bundle them in the edge/browser runtime
  serverExternalPackages: ['nodemailer', 'jspdf', 'jspdf-autotable', 'bcrypt'],

  // Allow S3-hosted images (logo uploads) to be used with next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },

  // Security & performance headers applied to every route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
