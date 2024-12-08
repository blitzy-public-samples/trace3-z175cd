// next.config.ts
// Next.js v13.x
// React v18.x

/**
 * Human Tasks:
 * 1. Ensure environment variables are properly set in deployment environments
 * 2. Configure CDN domains in production environment
 * 3. Verify SSL certificates for custom domains
 * 4. Set up proper CORS policies for API endpoints
 * 5. Configure rate limiting for API routes
 */

// Requirement: Frontend Framework and Libraries
// Location: Technical Specification/6. TECHNOLOGY STACK/Frontend Libraries
// Description: Configures the Next.js framework to optimize performance, enable server-side rendering, 
// and integrate with other frontend libraries.
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image optimization and allowed domains
  images: {
    domains: [
      'example.com',
      'cdn.example.com'
    ],
    // Enable image optimization
    unoptimized: false,
    // Set reasonable image device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Set image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Limit maximum image size
    minimumCacheTTL: 60,
    // Enable dangerously allow SVG to support vector graphics
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Requirement: Environment-Specific Configuration
  // Location: Technical Specification/6. TECHNOLOGY STACK/Development & Deployment
  // Description: Supports environment-specific configurations for development, staging, and production environments.
  env: {
    API_URL: 'https://api.example.com',
    NODE_ENV: 'development',
  },

  // Configure build output
  output: 'standalone',

  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Configure webpack for optimizations
  webpack: (config, { dev, isServer }) => {
    // Enable tree shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
    };

    // Add production-only optimizations
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },

  // Configure build-time options
  experimental: {
    // Enable app directory for new routing features
    appDir: true,
    // Enable server components
    serverComponents: true,
    // Enable concurrent features
    concurrentFeatures: true,
  },

  // Configure redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configure rewrites for API proxying
  async rewrites() {
    return {
      beforeFiles: [
        // Add API proxying rules here
      ],
      afterFiles: [
        // Add dynamic route handling here
      ],
      fallback: [
        // Add fallback routes here
      ],
    };
  },

  // Configure build-time constants
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: 'secret',
  },

  // Configure public runtime config
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
};

export default nextConfig;