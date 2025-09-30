import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // Compress pages
  compress: true,

  // Server external packages (moved from experimental)
  serverExternalPackages: ['mongoose'],

  // Set output file tracing root to silence workspace warning
  outputFileTracingRoot: __dirname,

  // Enable experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these packages on the server
      config.externals.push('mongoose');
    }
    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'nanma-family-fest-2025',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
