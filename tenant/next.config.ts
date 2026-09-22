import type { NextConfig } from "next";
import { locales } from "./locales.config";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LOCALES: JSON.stringify(locales),
  },
};

export default nextConfig;
