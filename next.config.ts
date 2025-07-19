import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove serverExternalPackages to allow proper bundling
  // serverExternalPackages: ['react-signature-canvas'],

  // Add transpilePackages to ensure proper transpilation
  transpilePackages: ['react-signature-canvas'],

  webpack: (config, { isServer }) => {
    // Handle canvas library issues in server-side rendering
    if (isServer) {
      config.externals.push('canvas');
    }

    // More comprehensive canvas handling
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Ensure signature-pad (dependency of react-signature-canvas) is properly handled
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    };

    return config;
  },

  // Remove transpilePackages since it conflicts with serverExternalPackages
  // transpilePackages: ['react-signature-canvas'], // REMOVED - conflicts with serverExternalPackages

  // Remove swcMinify as it's deprecated (SWC is now default)
  // swcMinify: true, // REMOVED - deprecated option

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
};

export default nextConfig;
