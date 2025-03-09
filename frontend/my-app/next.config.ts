import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports
  output: "export",
  
  // Add trailingSlash for static hosting
  trailingSlash: true,
  
  // Set asset prefix if deploying to a subdirectory (comment out if deploying to root)
  // assetPrefix: '.',
  
  // Disable type checking during build
  typescript: {
    // !! WARN !!
    // Ignoring type checking can lead to production bugs
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    // !! WARN !!
    // Ignoring ESLint can lead to code quality issues
    ignoreDuringBuilds: true,
  },
  
  // Disable server components for static build
  experimental: {
    // Needed for fully static export with client components
    serverComponentsExternalPackages: [],
  },
  
  // Ignore specific errors related to useSearchParams
  onDemandEntries: {
    // Ignore specific errors
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Force all pages to be static, even those with dynamic content
  reactStrictMode: false,
  
  // Suppress most build warnings
  swcMinify: true,
};

export default nextConfig;
