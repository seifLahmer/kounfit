
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    // Will only be available on the server side
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from
    // the Firebase Studio environment.
    allowedDevOrigins: ['**.cloudworkstations.dev'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false, // Disable source maps in production
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
     config.module.rules.push({
      test: /node_modules\/handlebars\//,
      loader: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;
