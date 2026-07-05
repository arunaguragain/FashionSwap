import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

// Proxy API requests to backend during development to avoid CORS and cookie issues.
// This keeps the browser origin as the frontend so backend cookies are treated same-site.
if (process.env.NODE_ENV !== 'production') {
  // add rewrites function
  ;(nextConfig as any).rewrites = async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050'}/api/:path*`,
      },
    ];
  };
}

export default nextConfig;
