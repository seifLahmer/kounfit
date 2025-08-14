
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to fix the "Cannot find module './XXX.js'" error
    // It is caused by server-side dependencies being bundled in the client-side build
    if (!isServer) {
        config.externals = [
            ...config.externals,
            '@opentelemetry/exporter-jaeger',
            '@genkit-ai/firebase',
        ];
    }

    // This is to fix the "require.extensions is not supported by webpack" warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'handlebars': false,
    };
    
    return config;
  },
};

export default nextConfig;
