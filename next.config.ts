import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const config: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "@react-three/drei"],
  },
};
export default createNextIntlPlugin("./src/i18n/request.ts")(config);
