import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/preferences/password",
        destination: "/dashboard/preferences/profile?tab=password",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
