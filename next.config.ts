import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Move serverComponentsExternalPackages to root level as serverExternalPackages
  serverExternalPackages: ['react-signature-canvas'],
  
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