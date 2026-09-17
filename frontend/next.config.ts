import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.14"],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'quisqueya-talent.vercel.app',
          },
        ],
        destination: 'https://www.quisqueyatalent.com.do/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://quisqueyatalent-api.onrender.com'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
