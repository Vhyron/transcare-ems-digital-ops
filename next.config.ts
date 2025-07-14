import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental features if needed
    serverComponentsExternalPackages: ['react-signature-canvas'],
  },
  webpack: (config, { isServer }) => {
    // Handle canvas library issues in server-side rendering
    if (isServer) {
      config.externals.push('canvas');
    }

    // Optimize bundle for signature canvas
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
  // Ensure proper transpilation
  transpilePackages: ['react-signature-canvas'],

  // Production optimizations
  swcMinify: true,

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
