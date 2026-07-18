import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "http://backend:5050" : "http://localhost:5050");

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  // Allow cross-origin dev requests from these origins (for dev server hot reload, assets)
  // Add additional origins as needed, exact origin must include protocol and port if used.
  allowedDevOrigins: [
    "http://192.168.137.1",
    "http://192.168.137.1:3000",
    "http://localhost:3000",
    "http://0.0.0.0:3000",
    "https://192.168.137.1:3000",
    "https://localhost:3000",
    "http://192.168.137.247",
    "http://192.168.137.247:3000",
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5050',
      },
      {
        protocol: 'http',
        hostname: '192.168.137.1',
        port: '5050',
      },
      {
        protocol: 'http',
        hostname: '192.168.137.247',
        port: '5050',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
};

// Proxy API requests to the backend so browser requests stay same-origin and
// the containerized frontend can reach the backend service over the Docker network.
(nextConfig as any).rewrites = async () => {
  return [
    {
      source: '/api/:path*',
      destination: `${apiBaseUrl}/api/:path*`,
    },
  ];
};

export default nextConfig;
