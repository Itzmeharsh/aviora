import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "puppeteer-core",
    "@sparticuz/chromium",
  ],

  outputFileTracingIncludes: {
    "/api/thali/jobs": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/resume/pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;